-- Migration: 0002_fix_rls_recursion.sql
-- Description: Fix infinite recursion in users RLS and add missing policies for activity_logs, transactions, etc.

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

-- Create a non-recursive version using auth.jwt()
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Funding Requests RLS
CREATE POLICY "Investors can view open funding requests" ON public.funding_requests
  FOR SELECT USING (status = 'open');

CREATE POLICY "Admins can view all funding requests" ON public.funding_requests
  FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Activity Logs RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Ensure other tables have basic RLS if enabled
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('repayments', 'penalties', 'pre_closure_requests')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('CREATE POLICY "Admins can view all %I" ON public.%I FOR SELECT USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'');', t, t, t);
    END LOOP;
END $$;
