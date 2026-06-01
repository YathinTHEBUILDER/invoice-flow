-- ==========================================
-- SECURITY HARDENING MIGRATION
-- ==========================================

-- 1. Create Admin Allowlist Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  )
);

-- 2. Safe Admin Checker Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- 3. Harden handle_new_user Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  safe_role public.user_role;
BEGIN
  -- Strict role validation: Only allow 'msme' and 'investor'.
  -- Admin accounts must never be created through the public trigger.
  safe_role :=
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'msme' THEN 'msme'::public.user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'investor' THEN 'investor'::public.user_role
      ELSE 'investor'::public.user_role
    END;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    company_name,
    kyc_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    safe_role,
    NEW.raw_user_meta_data->>'company_name',
    'not_started',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 4. Lock Down Profiles RLS Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Select own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Safe User Profile Updates RPC
CREATE OR REPLACE FUNCTION public.update_own_profile_details(
  p_full_name TEXT,
  p_company_name TEXT,
  p_company_address TEXT,
  p_gstin TEXT,
  p_pan TEXT,
  p_bank_account_no TEXT,
  p_ifsc_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.profiles
  SET
    full_name = p_full_name,
    company_name = p_company_name,
    company_address = p_company_address,
    gstin = p_gstin,
    pan = p_pan,
    bank_account_no = p_bank_account_no,
    ifsc_code = p_ifsc_code,
    updated_at = now()
  WHERE id = auth.uid();
END;
$$;

-- 6. Harden SECURITY DEFINER RPCs

-- Drop legacy signatures
DROP FUNCTION IF EXISTS public.invest_in_invoice(uuid, uuid, numeric);
DROP FUNCTION IF EXISTS public.create_withdrawal_request(uuid, numeric, text);
DROP FUNCTION IF EXISTS public.disburse_to_msme(uuid, uuid);
DROP FUNCTION IF EXISTS public.settle_repayment(uuid, uuid, text);

-- Secure invest_in_invoice
CREATE OR REPLACE FUNCTION public.invest_in_invoice(
    p_invoice_id UUID,
    p_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_investor_id UUID;
    v_wallet_balance NUMERIC;
    v_role public.user_role;
    v_kyc_status TEXT;
    v_invoice_status TEXT;
    v_verified_amount NUMERIC;
    v_funded_amount NUMERIC;
    v_remaining_amount NUMERIC;
    v_invoice_number TEXT;
    v_msme_id UUID;
    v_discount_rate NUMERIC;
    v_tenure_days INTEGER;
    v_new_funded_amount NUMERIC;
    v_discount_amount NUMERIC;
    v_deployment_amount NUMERIC;
    v_msme_disbursement NUMERIC;
    v_due_date DATE;
BEGIN
    v_investor_id := auth.uid();
    IF v_investor_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: User not authenticated.');
    END IF;

    -- 1. Ensure investor exists, is authorized, is verified, and lock profile
    SELECT wallet_balance, role, kyc_status INTO v_wallet_balance, v_role, v_kyc_status 
    FROM public.profiles 
    WHERE id = v_investor_id FOR UPDATE;

    IF v_role IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Investor profile not found.');
    END IF;

    IF v_role <> 'investor' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Access Denied: Only investors can fund invoices.');
    END IF;

    IF v_kyc_status <> 'verified' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Verification Required: Please complete KYC verification.');
    END IF;

    -- 2. Ensure invoice exists and lock for atomic funding update
    SELECT status, COALESCE(verified_amount, amount), funded_amount, invoice_number, msme_id, discount_rate, tenure_days, due_date
    INTO v_invoice_status, v_verified_amount, v_funded_amount, v_invoice_number, v_msme_id, v_discount_rate, v_tenure_days, v_due_date
    FROM public.invoices 
    WHERE id = p_invoice_id FOR UPDATE;

    IF v_invoice_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found.');
    END IF;

    IF v_invoice_status NOT IN ('approved', 'partially_funded') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not available for funding (Current Status: ' || v_invoice_status || ')');
    END IF;

    -- 3. Calculate remaining capacity
    v_remaining_amount := v_verified_amount - COALESCE(v_funded_amount, 0);
    
    IF p_amount > v_remaining_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Participation exceeds remaining capacity. Max allowed: ' || v_remaining_amount);
    END IF;

    -- 4. Calculate Financials
    v_discount_amount := ROUND(p_amount * COALESCE(v_discount_rate, 0.12) * (COALESCE(v_tenure_days, 45)::NUMERIC / 365.0));
    v_deployment_amount := p_amount - v_discount_amount;
    v_msme_disbursement := p_amount - v_discount_amount;

    -- 5. Check if investor has enough balance
    IF v_wallet_balance < v_deployment_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient wallet balance. Deployed amount needed: ' || v_deployment_amount || ', Available: ' || v_wallet_balance);
    END IF;

    -- 6. Update investor wallet (Debit)
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - v_deployment_amount,
        updated_at = now()
    WHERE id = v_investor_id;

    -- 7. Update MSME wallet (Credit)
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + v_msme_disbursement,
        updated_at = now()
    WHERE id = v_msme_id;

    -- 8. Update invoice funding status
    v_new_funded_amount := COALESCE(v_funded_amount, 0) + p_amount;
    
    UPDATE public.invoices 
    SET funded_amount = v_new_funded_amount,
        status = CASE 
            WHEN v_new_funded_amount >= v_verified_amount THEN 'funded' 
            ELSE 'partially_funded' 
        END,
        funded_at = CASE 
            WHEN v_new_funded_amount >= v_verified_amount THEN now() 
            ELSE funded_at 
        END,
        updated_at = now()
    WHERE id = p_invoice_id;

    -- 9. Create/Update Repayment Schedule
    INSERT INTO public.repayments (invoice_id, amount_due, due_date, status)
    VALUES (p_invoice_id, v_verified_amount, v_due_date, 'scheduled')
    ON CONFLICT (invoice_id) DO UPDATE SET amount_due = v_verified_amount, status = 'scheduled'
    WHERE public.repayments.invoice_id = p_invoice_id;

    -- 10. Insert investment record
    INSERT INTO public.investments (invoice_id, investor_id, amount, status)
    VALUES (p_invoice_id, v_investor_id, p_amount, 'active');

    -- 11. Transaction Logging
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (v_investor_id, -v_deployment_amount, 'investment', 'Capital Deployment for Invoice #' || v_invoice_number || ' (Share Face Value: ' || p_amount || ')', p_invoice_id);

    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (v_msme_id, v_msme_disbursement, 'funding', 'Funding received for Invoice #' || v_invoice_number, p_invoice_id);

    RETURN jsonb_build_object(
        'success', true, 
        'invoice_number', v_invoice_number, 
        'deployed', v_deployment_amount,
        'msme_received', v_msme_disbursement
    );
END;
$$;

-- Secure create_withdrawal_request
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
    p_amount NUMERIC,
    p_description TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_current_balance NUMERIC;
    v_withdrawal_id UUID;
    v_bank_account_no TEXT;
    v_ifsc_code TEXT;
    v_kyc_status TEXT;
    v_fee_amount NUMERIC;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- 1. Get current balance and bank details
    SELECT wallet_balance, bank_account_no, ifsc_code, kyc_status
    INTO v_current_balance, v_bank_account_no, v_ifsc_code, v_kyc_status
    FROM public.profiles 
    WHERE id = v_user_id FOR UPDATE;

    -- 2. Compliance check
    IF v_kyc_status != 'verified' THEN
        RAISE EXCEPTION 'KYC verification required for withdrawals.';
    END IF;

    IF v_bank_account_no IS NULL OR v_ifsc_code IS NULL THEN
        RAISE EXCEPTION 'Bank account details not found. Please update your profile.';
    END IF;

    -- 3. Calculate Fee (0.42% of withdrawal amount)
    v_fee_amount := ROUND(p_amount * 0.0042, 2);

    -- 4. Validate balance
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient liquidity for this withdrawal.';
    END IF;

    -- 5. Deduct balance
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - p_amount,
        updated_at = now()
    WHERE id = v_user_id;

    -- 6. Create withdrawal request
    INSERT INTO public.withdrawals (user_id, amount, fee, status, bank_account_no, ifsc_code, notes)
    VALUES (v_user_id, p_amount, v_fee_amount, 'pending', v_bank_account_no, v_ifsc_code, p_description)
    RETURNING id INTO v_withdrawal_id;

    -- 7. Create transaction log
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (v_user_id, -p_amount, 'withdrawal', 'Withdrawal Request #' || UPPER(LEFT(v_withdrawal_id::TEXT, 8)) || ' (Incl. Platform Fee: ₹' || v_fee_amount || ')', v_withdrawal_id);

    RETURN v_withdrawal_id;
END;
$$;

-- Secure disburse_to_msme
CREATE OR REPLACE FUNCTION public.disburse_to_msme(
    p_invoice_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id UUID;
    v_msme_id UUID;
    v_invoice_number TEXT;
    v_amount NUMERIC;
    v_discount_rate NUMERIC;
    v_tenure_days INTEGER;
    v_status TEXT;
    v_discount_amount NUMERIC;
    v_payout_amount NUMERIC;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Admin only';
    END IF;

    v_admin_id := auth.uid();

    -- 1. Ensure invoice is fully funded
    SELECT msme_id, invoice_number, verified_amount, discount_rate, tenure_days, status
    INTO v_msme_id, v_invoice_number, v_amount, v_discount_rate, v_tenure_days, v_status
    FROM public.invoices
    WHERE id = p_invoice_id FOR UPDATE;

    IF v_msme_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found.');
    END IF;

    IF v_status != 'funded' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice must be fully funded before disbursement.');
    END IF;

    -- 2. Calculate Payout
    v_discount_amount := ROUND(v_amount * COALESCE(v_discount_rate, 0.12) * (COALESCE(v_tenure_days, 45)::NUMERIC / 365.0));
    v_payout_amount := v_amount - v_discount_amount;

    -- 3. Update MSME wallet
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + v_payout_amount,
        updated_at = now()
    WHERE id = v_msme_id;

    -- 4. Insert transaction log for MSME
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (v_msme_id, v_payout_amount, 'payout', 'Disbursement for Invoice #' || v_invoice_number || ' (After Discount)', p_invoice_id);

    -- 5. Log admin action
    INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (v_admin_id, 'disburse_funds', 'invoice', p_invoice_id, jsonb_build_object('payout', v_payout_amount));

    RETURN jsonb_build_object('success', true, 'payout', v_payout_amount);
END;
$$;

-- Secure settle_repayment
CREATE OR REPLACE FUNCTION public.settle_repayment(
    p_repayment_id UUID,
    p_status TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_repayment RECORD;
    v_invoice RECORD;
    v_investment RECORD;
    v_total_face_value NUMERIC;
    v_penalty_amount NUMERIC;
    v_distributable_amount NUMERIC;
    v_investor_share NUMERIC;
    v_credit_amount NUMERIC;
    v_count INTEGER := 0;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Admin only';
    END IF;

    -- 1. Lock and fetch repayment
    SELECT * INTO v_repayment 
    FROM public.repayments 
    WHERE id = p_repayment_id FOR UPDATE;

    IF v_repayment.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Repayment record not found.');
    END IF;

    IF v_repayment.status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Repayment has already been processed.');
    END IF;

    -- 2. Handle Rejection
    IF p_status != 'repaid' THEN
        UPDATE public.repayments 
        SET status = 'overdue', updated_at = now() 
        WHERE id = p_repayment_id;
        
        RETURN jsonb_build_object('success', true, 'status', 'overdue');
    END IF;

    -- 3. Lock and fetch invoice
    SELECT * INTO v_invoice 
    FROM public.invoices 
    WHERE id = v_repayment.invoice_id FOR UPDATE;

    v_total_face_value := COALESCE(v_invoice.verified_amount, v_invoice.amount);
    v_penalty_amount := COALESCE(v_repayment.penalty_amount, 0);
    
    -- Distributable = Total Paid - Platform Penalties
    v_distributable_amount := COALESCE(v_repayment.amount_paid, 0) - v_penalty_amount;

    -- 4. Update Statuses
    UPDATE public.repayments 
    SET status = 'paid', updated_at = now() 
    WHERE id = p_repayment_id;

    UPDATE public.invoices 
    SET status = 'repaid', updated_at = now() 
    WHERE id = v_invoice.id;

    -- 5. Distribute to Investors
    FOR v_investment IN 
        SELECT * FROM public.investments 
        WHERE invoice_id = v_invoice.id AND status = 'active'
    LOOP
        -- Calculate Pro-rata share of face value settlement
        v_investor_share := v_investment.amount / v_total_face_value;
        v_credit_amount := ROUND(v_distributable_amount * v_investor_share);

        -- Credit Investor Wallet
        UPDATE public.profiles 
        SET wallet_balance = wallet_balance + v_credit_amount,
            updated_at = now()
        WHERE id = v_investment.investor_id;

        -- Update Investment Status
        UPDATE public.investments 
        SET status = 'repaid', updated_at = now() 
        WHERE id = v_investment.id;

        -- Log Payout Transaction
        INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
        VALUES (v_investment.investor_id, v_credit_amount, 'payout', 'Repayment received for Invoice #' || v_invoice.invoice_number, v_invoice.id);
        
        v_count := v_count + 1;
    END LOOP;

    -- 6. Log Platform Revenue (Penalty) if any
    IF v_penalty_amount > 0 THEN
        INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
        VALUES (v_invoice.msme_id, -v_penalty_amount, 'platform_fee', 'Pre-closure Penalty for Invoice #' || v_invoice.invoice_number, v_invoice.id);
    END IF;

    -- 7. Audit Log
    INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'settle_repayment', 'repayment', p_repayment_id, jsonb_build_object('investors_paid', v_count, 'penalty_captured', v_penalty_amount));

    RETURN jsonb_build_object('success', true, 'investors_paid', v_count, 'penalty_captured', v_penalty_amount);
END;
$$;

-- 7. Create Atomic Admin RPCs

-- approve_kyc_request
CREATE OR REPLACE FUNCTION public.approve_kyc_request(
    p_user_id UUID,
    p_request_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Admin only';
    END IF;

    -- 1. Update Profile
    UPDATE public.profiles
    SET 
        kyc_status = 'verified', 
        kyc_notes = 'KYC verified successfully.',
        kyc_rejection_count = 0,
        last_kyc_rejected_at = null,
        updated_at = now()
    WHERE id = p_user_id;

    -- 2. Update KYC Request
    UPDATE public.kyc_requests
    SET 
        status = 'verified', 
        updated_at = now()
    WHERE id = p_request_id;

    -- 3. Log Platform Fee transaction
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (p_user_id, -50000, 'platform_fee', 'One-time Platform Setup Fee (1% of facility limit)', p_request_id);

    -- 4. Audit Log
    INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'approve_kyc', 'profile', p_user_id, jsonb_build_object('requestId', p_request_id, 'fee', 50000));

    RETURN jsonb_build_object('success', true);
END;
$$;

-- reject_kyc_request
CREATE OR REPLACE FUNCTION public.reject_kyc_request(
    p_user_id UUID,
    p_request_id UUID,
    p_notes TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rejection_count INTEGER;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Admin only';
    END IF;

    SELECT COALESCE(kyc_rejection_count, 0) INTO v_rejection_count
    FROM public.profiles
    WHERE id = p_user_id;

    -- 1. Update Profile
    UPDATE public.profiles
    SET 
        kyc_status = 'rejected', 
        kyc_notes = p_notes,
        kyc_rejection_count = v_rejection_count + 1,
        last_kyc_rejected_at = now(),
        updated_at = now()
    WHERE id = p_user_id;

    -- 2. Update KYC Request
    UPDATE public.kyc_requests
    SET 
        status = 'rejected', 
        notes = p_notes, 
        updated_at = now()
    WHERE id = p_request_id;

    -- 3. Audit Log
    INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'reject_kyc', 'profile', p_user_id, jsonb_build_object('requestId', p_request_id, 'notes', p_notes));

    RETURN jsonb_build_object('success', true);
END;
$$;

-- approve_invoice_request
CREATE OR REPLACE FUNCTION public.approve_invoice_request(
    p_invoice_id UUID,
    p_verified_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_amount NUMERIC;
    v_verified_amount NUMERIC;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Admin only';
    END IF;

    SELECT amount INTO v_amount
    FROM public.invoices
    WHERE id = p_invoice_id;

    v_verified_amount := COALESCE(p_verified_amount, v_amount);

    -- 1. Update Invoice
    UPDATE public.invoices
    SET
        status = 'approved',
        verified_amount = v_verified_amount,
        updated_at = now()
    WHERE id = p_invoice_id;

    -- 2. Audit Log
    INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'approve_invoice', 'invoice', p_invoice_id, jsonb_build_object('status', 'approved', 'verified_amount', v_verified_amount));

    RETURN jsonb_build_object('success', true);
END;
$$;

-- reject_invoice_request
CREATE OR REPLACE FUNCTION public.reject_invoice_request(
    p_invoice_id UUID,
    p_notes TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Admin only';
    END IF;

    -- 1. Update Invoice
    UPDATE public.invoices
    SET
        status = 'rejected',
        admin_notes = p_notes,
        updated_at = now()
    WHERE id = p_invoice_id;

    -- 2. Audit Log
    INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'reject_invoice', 'invoice', p_invoice_id, jsonb_build_object('status', 'rejected', 'notes', p_notes));

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 8. Create Rate Limits Table & RPC
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_record public.rate_limits%ROWTYPE;
BEGIN
  SELECT *
  INTO v_record
  FROM public.rate_limits
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND OR v_record.expires_at < v_now THEN
    INSERT INTO public.rate_limits(key, count, expires_at)
    VALUES (p_key, 1, v_now + make_interval(secs => p_window_seconds))
    ON CONFLICT (key) DO UPDATE
    SET count = 1,
        expires_at = EXCLUDED.expires_at;

    RETURN jsonb_build_object('success', true, 'remaining', p_limit - 1);
  END IF;

  IF v_record.count >= p_limit THEN
    RETURN jsonb_build_object('success', false, 'remaining', 0);
  END IF;

  UPDATE public.rate_limits
  SET count = count + 1
  WHERE key = p_key;

  RETURN jsonb_build_object('success', true, 'remaining', p_limit - v_record.count - 1);
END;
$$;

-- 9. Standardize Notification Schema & Drop Legacy read Column if present
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;

UPDATE public.notifications
SET is_read = COALESCE(is_read, false)
WHERE is_read IS NULL;

ALTER TABLE public.notifications DROP COLUMN IF EXISTS read;

-- 10. Add Support Ticket Constraints
ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_priority_check;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_priority_check
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_category_check;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_category_check
CHECK (category IN ('invoice', 'kyc', 'repayment', 'technical', 'other'));
