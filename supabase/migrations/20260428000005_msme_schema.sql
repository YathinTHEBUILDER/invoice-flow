-- ==========================================
-- INVOICEFLOW MSME & REPAYMENTS SCHEMA
-- ==========================================

-- 1. Extend Profiles with Business Details
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gstin TEXT,
ADD COLUMN IF NOT EXISTS pan TEXT,
ADD COLUMN IF NOT EXISTS bank_account_no TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'not_started'; -- not_started, pending, verified, rejected

-- 2. Update Invoices with Buyer Details
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS buyer_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_gstin TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS verified_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS repayment_status TEXT DEFAULT 'pending'; -- pending, partially_paid, fully_paid, overdue

-- 3. Repayments Table
CREATE TABLE IF NOT EXISTS public.repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    payment_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, paid, overdue, defaulted
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL, -- invoice, kyc, repayment, technical, other
    status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
    priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- Repayments: MSMEs can see their own invoice repayments
CREATE POLICY "MSMEs can see their own repayments" ON public.repayments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE public.invoices.id = public.repayments.invoice_id 
            AND public.invoices.msme_id = auth.uid()
        )
    );

-- Notifications: Users see their own
CREATE POLICY "Users can see their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Support Tickets: Users see and create their own
CREATE POLICY "Users can see their own support tickets" ON public.support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 8. Admin Policies
CREATE POLICY "Admins can manage all repayments" ON public.repayments
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all support tickets" ON public.support_tickets
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
