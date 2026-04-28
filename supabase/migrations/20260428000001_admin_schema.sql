-- ==========================================
-- INVOICEFLOW ADMIN & OPERATIONS SCHEMA
-- ==========================================

-- 1. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    msme_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    discount_rate DECIMAL(5, 4) NOT NULL, -- e.g. 0.1450 (14.5%)
    tenure_days INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_verification', -- pending_verification, active, funded, repaid, disputed
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KYC Requests Table
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, under_review
    documents JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions Table (Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    type TEXT NOT NULL, -- deposit, withdrawal, investment, return, fee, penalty
    description TEXT,
    reference_id UUID, -- Can be invoice_id, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    raised_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'new', -- new, investigation, hearing, resolved
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.platform_settings (key, value)
VALUES 
    ('platform_commission', '1.0'),
    ('preclosure_penalty', '2.5')
ON CONFLICT (key) DO NOTHING;

-- 6. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 7. Policies (Basic Admin access)
-- Note: In a real app, we'd check the 'role' from public.profiles
CREATE POLICY "Admins can manage all invoices" ON public.invoices
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all KYC" ON public.kyc_requests
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all transactions" ON public.transactions
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all disputes" ON public.disputes
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    
-- Allow MSMEs/Investors to see their own data (simplified)
CREATE POLICY "Users can see their own invoices" ON public.invoices
    FOR SELECT USING (msme_id = auth.uid());

CREATE POLICY "Users can see their own KYC" ON public.kyc_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can see their own transactions" ON public.transactions
    FOR SELECT USING (user_id = auth.uid());
