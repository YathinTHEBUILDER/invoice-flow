-- Create Withdrawal RPC for atomic wallet operations
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
BEGIN
    -- 1. Get current balance and bank details
    SELECT wallet_balance, bank_account_no, ifsc_code, kyc_status
    INTO v_current_balance, v_bank_account_no, v_ifsc_code, v_kyc_status
    FROM public.profiles 
    WHERE id = p_user_id;

    -- 2. Compliance check
    IF v_kyc_status != 'verified' THEN
        RAISE EXCEPTION 'KYC verification required for withdrawals.';
    END IF;

    IF v_bank_account_no IS NULL OR v_ifsc_code IS NULL THEN
        RAISE EXCEPTION 'Bank account details not found. Please update your profile.';
    END IF;

    -- 3. Validate balance
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient liquidity for this withdrawal.';
    END IF;

    -- 4. Deduct balance
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- 5. Create withdrawal request
    INSERT INTO public.withdrawals (user_id, amount, status, bank_account_no, ifsc_code, notes)
    VALUES (p_user_id, p_amount, 'pending', v_bank_account_no, v_ifsc_code, p_description)
    RETURNING id INTO v_withdrawal_id;

    -- 6. Create transaction log
    INSERT INTO public.transactions (user_id, amount, type, description, reference_id)
    VALUES (p_user_id, -p_amount, 'withdrawal', 'Withdrawal Request #' || UPPER(LEFT(v_withdrawal_id::TEXT, 8)), v_withdrawal_id);

    RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
