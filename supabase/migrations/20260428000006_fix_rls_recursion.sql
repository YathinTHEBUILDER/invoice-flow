-- ==========================================
-- FIX RLS RECURSION & HARDEN DATABASE
-- ==========================================

-- 1. Optimize is_admin() to break recursion
-- This function queries auth.users directly to avoid circular dependencies with the profiles table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT (raw_user_meta_data->>'role')::text = 'admin'
        FROM auth.users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. Consolidate PROFILES Policies
-- Removes overlapping and recursive policies to ensure a clean security model.
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles 
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles 
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

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
