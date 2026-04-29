-- 1. Add fee column to withdrawals table
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS fee NUMERIC DEFAULT 0;

-- 2. Update invest_in_invoice RPC (Remove 1% Investment Fee)
CREATE OR REPLACE FUNCTION public.invest_in_invoice(
    p_investor_id UUID,
    p_invoice_id UUID,
    p_amount NUMERIC
) RETURNS JSONB AS $$
DECLARE
    v_wallet_balance NUMERIC;
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
    -- 1. Ensure investor exists and lock profile for atomic balance update
    SELECT wallet_balance INTO v_wallet_balance 
    FROM public.profiles 
    WHERE id = p_investor_id FOR UPDATE;

    IF v_wallet_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Investor profile not found.');
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

    -- 3. Calculate remaining capacity (Face Value)
    v_remaining_amount := v_verified_amount - COALESCE(v_funded_amount, 0);
    
    IF p_amount > v_remaining_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Participation exceeds remaining capacity. Max allowed: ' || v_remaining_amount);
    END IF;

    -- 4. Calculate Official Discounting Model Financials (NO PLATFORM FEE HERE)
    v_discount_amount := ROUND(p_amount * COALESCE(v_discount_rate, 0.12) * (COALESCE(v_tenure_days, 45)::NUMERIC / 365.0));
    
    -- Investor Perspective: Deploys discounted amount
    v_deployment_amount := p_amount - v_discount_amount;
    
    -- MSME Perspective: Receives deployment amount (Full amount, no platform fee at this stage)
    v_msme_disbursement := p_amount - v_discount_amount;

    -- 5. Check if investor has enough balance for DEPLOYMENT
    IF v_wallet_balance < v_deployment_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient wallet balance. Deployed amount needed: ' || v_deployment_amount || ', Available: ' || v_wallet_balance);
    END IF;

    -- 6. Update investor wallet (Debit)
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - v_deployment_amount,
        updated_at = now()
    WHERE id = p_investor_id;

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
    VALUES (p_invoice_id, p_investor_id, p_amount, 'active');

    -- 11. Transaction Logging
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (p_investor_id, -v_deployment_amount, 'investment', 'Capital Deployment for Invoice #' || v_invoice_number || ' (Share Face Value: ' || p_amount || ')', p_invoice_id);

    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (v_msme_id, v_msme_disbursement, 'funding', 'Funding received for Invoice #' || v_invoice_number, p_invoice_id);

    RETURN jsonb_build_object(
        'success', true, 
        'invoice_number', v_invoice_number, 
        'deployed', v_deployment_amount,
        'msme_received', v_msme_disbursement
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update create_withdrawal_request RPC (Add 0.42% Platform Fee)
CREATE OR REPLACE FUNCTION create_withdrawal_request(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT
) RETURNS UUID AS $$
DECLARE
    v_current_balance NUMERIC;
    v_withdrawal_id UUID;
    v_bank_account_no TEXT;
    v_ifsc_code TEXT;
    v_kyc_status TEXT;
    v_fee_amount NUMERIC;
BEGIN
    -- 1. Get current balance and bank details
    SELECT wallet_balance, bank_account_no, ifsc_code, kyc_status
    INTO v_current_balance, v_bank_account_no, v_ifsc_code, v_kyc_status
    FROM public.profiles 
    WHERE id = p_user_id FOR UPDATE;

    -- 2. Compliance check
    IF v_kyc_status != 'verified' THEN
        RAISE EXCEPTION 'KYC verification required for withdrawals.';
    END IF;

    IF v_bank_account_no IS NULL OR v_ifsc_code IS NULL THEN
        RAISE EXCEPTION 'Bank account details not found. Please update your profile.';
    END IF;

    -- 3. Calculate Fee (0.42% of withdrawal amount)
    v_fee_amount := ROUND(p_amount * 0.0042, 2);

    -- 4. Validate balance (Deducting gross amount)
    -- We'll deduct the gross amount (p_amount) from wallet.
    -- The user actually receives (p_amount - v_fee_amount) in their bank.
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient liquidity for this withdrawal.';
    END IF;

    -- 5. Deduct balance
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- 6. Create withdrawal request
    INSERT INTO public.withdrawals (user_id, amount, fee, status, bank_account_no, ifsc_code, notes)
    VALUES (p_user_id, p_amount, v_fee_amount, 'pending', v_bank_account_no, v_ifsc_code, p_description)
    RETURNING id INTO v_withdrawal_id;

    -- 7. Create transaction log
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (p_user_id, -p_amount, 'withdrawal', 'Withdrawal Request #' || UPPER(LEFT(v_withdrawal_id::TEXT, 8)) || ' (Incl. Platform Fee: ₹' || v_fee_amount || ')', v_withdrawal_id);

    RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update disburse_to_msme RPC (Remove 1% fee)
CREATE OR REPLACE FUNCTION disburse_to_msme(
    p_invoice_id UUID,
    p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_msme_id UUID;
    v_invoice_number TEXT;
    v_amount NUMERIC; -- Face Value
    v_discount_rate NUMERIC;
    v_tenure_days INTEGER;
    v_status TEXT;
    v_discount_amount NUMERIC;
    v_payout_amount NUMERIC;
BEGIN
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

    -- 2. Calculate Payout (No Platform Fee)
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
    VALUES (p_admin_id, 'disburse_funds', 'invoice', p_invoice_id, jsonb_build_object('payout', v_payout_amount));

    RETURN jsonb_build_object('success', true, 'payout', v_payout_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
