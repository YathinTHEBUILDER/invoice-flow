-- ==========================================
-- FIX RLS RECURSION & HARDEN POLICIES
-- ==========================================

-- 1. Create is_admin() helper function
-- This function is SECURITY DEFINER, meaning it runs with the privileges 
-- of the creator (postgres), bypassing RLS checks on the profiles table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Refactor PROFILES Policies
-- Explicitly drop to ensure a clean state
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 3. Refactor INVOICES Policies
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can see their own invoices" ON public.invoices;

CREATE POLICY "Admins can manage all invoices" ON public.invoices
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can see their own invoices" ON public.invoices
    FOR SELECT USING (msme_id = auth.uid());

-- 4. Refactor KYC_REQUESTS Policies
DROP POLICY IF EXISTS "Admins can manage all KYC" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users can see their own KYC" ON public.kyc_requests;

CREATE POLICY "Admins can manage all KYC" ON public.kyc_requests
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can see their own KYC" ON public.kyc_requests
    FOR SELECT USING (user_id = auth.uid());

-- 5. Refactor TRANSACTIONS Policies
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can see their own transactions" ON public.transactions;

CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can see their own transactions" ON public.transactions
    FOR SELECT USING (user_id = auth.uid());

-- 6. Refactor DISPUTES Policies
DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;

CREATE POLICY "Admins can manage all disputes" ON public.disputes
    FOR ALL USING (public.is_admin());

-- 7. Refactor PLATFORM_SETTINGS Policies
DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;

CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (public.is_admin());

-- 8. Refactor REPAYMENTS Policies
DROP POLICY IF EXISTS "Admins can manage all repayments" ON public.repayments;
DROP POLICY IF EXISTS "MSMEs can see their own repayments" ON public.repayments;

CREATE POLICY "Admins can manage all repayments" ON public.repayments
    FOR ALL USING (public.is_admin());

CREATE POLICY "MSMEs can see their own repayments" ON public.repayments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE public.invoices.id = public.repayments.invoice_id 
            AND public.invoices.msme_id = auth.uid()
        )
    );

-- 9. Refactor NOTIFICATIONS Policies
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can see their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can see their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- 10. Refactor SUPPORT_TICKETS Policies
DROP POLICY IF EXISTS "Admins can manage all support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can see their own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create their own support tickets" ON public.support_tickets;

CREATE POLICY "Admins can manage all support tickets" ON public.support_tickets
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can see their own support tickets" ON public.support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 11. Refactor AUDIT_LOGS Policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true); -- Usually inserted via security definer functions or server-side
