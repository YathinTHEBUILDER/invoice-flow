-- Atomic RPC for Investing in an Invoice
-- Handles wallet balances, invoice status, repayment scheduling, and transaction logging
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
    v_platform_fee NUMERIC;
    v_msme_disbursement NUMERIC;
    v_due_date DATE;
    v_admin_id UUID;
BEGIN
    -- 1. Ensure investor exists and lock profile for atomic balance update
    SELECT wallet_balance INTO v_wallet_balance 
    FROM public.profiles 
    WHERE id = p_investor_id FOR UPDATE;

    IF v_wallet_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Investor profile not found.');
    END IF;

    -- 2. Ensure invoice exists and lock for atomic funding update
    -- Use verified_amount if available, otherwise fallback to original amount
    SELECT status, COALESCE(verified_amount, amount), funded_amount, invoice_number, msme_id, discount_rate, tenure_days, due_date
    INTO v_invoice_status, v_verified_amount, v_funded_amount, v_invoice_number, v_msme_id, v_discount_rate, v_tenure_days, v_due_date
    FROM public.invoices 
    WHERE id = p_invoice_id FOR UPDATE;

    IF v_invoice_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found.');
    END IF;

    -- Only allow funding for approved or partially funded invoices
    IF v_invoice_status NOT IN ('approved', 'partially_funded') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not available for funding (Current Status: ' || v_invoice_status || ')');
    END IF;

    -- 3. Calculate remaining capacity (Face Value)
    v_remaining_amount := v_verified_amount - COALESCE(v_funded_amount, 0);
    
    IF p_amount > v_remaining_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Participation exceeds remaining capacity. Max allowed: ' || v_remaining_amount);
    END IF;

    -- 4. Calculate Official Discounting Model Financials
    -- Discount = Share_Face_Value * Rate * (Tenure / 365)
    v_discount_amount := ROUND(p_amount * COALESCE(v_discount_rate, 0.12) * (COALESCE(v_tenure_days, 45)::NUMERIC / 365.0));
    
    -- Platform Fee = Share_Face_Value * 1% (Fixed as per spec)
    v_platform_fee := ROUND(p_amount * 0.01);
    
    -- Investor Perspective: Deploys discounted amount
    v_deployment_amount := p_amount - v_discount_amount;
    
    -- MSME Perspective: Receives deployment amount minus platform fee
    v_msme_disbursement := p_amount - v_discount_amount - v_platform_fee;

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
    -- Repayment amount_due is the total Face Value (verified_amount)
    -- We insert or update the record associated with this invoice
    -- Using amount_due as the total liability the MSME must settle
    INSERT INTO public.repayments (invoice_id, amount_due, due_date, status)
    VALUES (p_invoice_id, v_verified_amount, v_due_date, 'scheduled')
    ON CONFLICT (invoice_id) DO UPDATE SET amount_due = v_verified_amount, status = 'scheduled'
    WHERE public.repayments.invoice_id = p_invoice_id;

    -- 10. Insert investment record (Store Share Share Value)
    INSERT INTO public.investments (invoice_id, investor_id, amount, status)
    VALUES (p_invoice_id, p_investor_id, p_amount, 'active');

    -- 11. Comprehensive Transaction Logging
    -- Investor: Capital Deployment
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (p_investor_id, -v_deployment_amount, 'investment', 'Capital Deployment for Invoice #' || v_invoice_number || ' (Share Face Value: ' || p_amount || ')', p_invoice_id);

    -- MSME: Funding Received
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (v_msme_id, v_msme_disbursement, 'funding', 'Funding received for Invoice #' || v_invoice_number || ' (Less Platform Fee: ' || v_platform_fee || ')', p_invoice_id);

    -- Platform: Commission Tracking (Assigned to admin for ledger visibility)
    SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
        VALUES (v_admin_id, v_platform_fee, 'platform_fee', 'Commission from Invoice #' || v_invoice_number || ' (Participation: ' || p_amount || ')', p_invoice_id);
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'invoice_number', v_invoice_number, 
        'deployed', v_deployment_amount,
        'msme_received', v_msme_disbursement,
        'fee', v_platform_fee
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
