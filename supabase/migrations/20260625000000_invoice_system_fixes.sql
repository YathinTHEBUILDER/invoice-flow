-- =======================================================
-- INVOICEFLOW SYSTEM FIXES & HARDENING
-- MIGRATION: 20260625000000_invoice_system_fixes.sql
-- =======================================================

-- 1. Hardening check constraints on kyc_requests and profiles status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_kyc_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_kyc_status_check 
  CHECK (kyc_status = ANY (ARRAY['not_started'::text, 'pending'::text, 'verified'::text, 'rejected'::text, 'under_review'::text]));

ALTER TABLE public.kyc_requests DROP CONSTRAINT IF EXISTS kyc_requests_status_check;
ALTER TABLE public.kyc_requests ADD CONSTRAINT kyc_requests_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'under_review'::text]));

-- 2. Adding constraints on invoices for positive numbers
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_amount_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_amount_check CHECK (amount > 0);

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_verified_amount_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_verified_amount_check CHECK (verified_amount > 0);

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_tenure_days_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_tenure_days_check CHECK (tenure_days > 0);

-- 3. Unique constraint on (msme_id, invoice_number) to prevent duplicate invoice numbers
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS unique_msme_invoice_number;
ALTER TABLE public.invoices ADD CONSTRAINT unique_msme_invoice_number UNIQUE (msme_id, invoice_number);

-- 4. Rebuilding RLS Policies for public.invoices
DROP POLICY IF EXISTS "MSMEs manage own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Investors view marketplace invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "MSMEs can select own invoices" ON public.invoices;
DROP POLICY IF EXISTS "MSMEs can insert own invoices" ON public.invoices;

-- Select policy: MSMEs can view only their own invoices
CREATE POLICY "MSMEs can select own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  msme_id = auth.uid()
);

-- Insert policy: MSMEs can insert their own invoices only when authenticated and verified
CREATE POLICY "MSMEs can insert own invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (
  msme_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'msme' AND kyc_status = 'verified'
  )
);

-- Select policy: Investors can view approved, funded, and active invoices
CREATE POLICY "Investors view marketplace invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  status = ANY (ARRAY['approved'::text, 'partially_funded'::text, 'funded'::text, 'disbursed'::text, 'repaid'::text])
);

-- Admin policy: Admins can do everything on invoices
CREATE POLICY "Admins manage all invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- 5. Rebuilding RLS Policies for public.kyc_requests
DROP POLICY IF EXISTS "Users manage own KYC" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users view own KYC" ON public.kyc_requests;
DROP POLICY IF EXISTS "Admins manage all KYC" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users can select own KYC" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users can insert/update own KYC" ON public.kyc_requests;
DROP POLICY IF EXISTS "Admins manage all KYC requests" ON public.kyc_requests;

CREATE POLICY "Users can select own KYC"
ON public.kyc_requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can insert/update own KYC"
ON public.kyc_requests
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending'::text
);

CREATE POLICY "Admins manage all KYC requests"
ON public.kyc_requests
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- 6. Add policy for public.platform_settings to let authenticated users view settings
DROP POLICY IF EXISTS "Admins manage settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Authenticated users can view platform settings" ON public.platform_settings;

CREATE POLICY "Admins manage settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Authenticated users can view platform settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (
  true
);

-- 7. Storage Bucket Policies (invoice-documents and kyc-documents)
-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Users can select their own invoices" ON storage.objects;
DROP POLICY IF EXISTS "Users can select their own legacy invoices" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can select their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload own invoice documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own invoice documents or admin all" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own KYC documents or admin all" ON storage.objects;

-- Create policies for invoice-documents
CREATE POLICY "Authenticated users can upload own invoice documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoice-documents'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can read own invoice documents or admin all"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoice-documents'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_admin()
  )
);

-- Create policies for kyc-documents
CREATE POLICY "Authenticated users can upload own KYC documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = ANY (ARRAY['kyc-documents'::text, 'kyc_documents'::text])
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can read own KYC documents or admin all"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = ANY (ARRAY['kyc-documents'::text, 'kyc_documents'::text])
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_admin()
  )
);

-- 8. Missing Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_msme_id ON public.invoices(msme_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_msme_invoice_number ON public.invoices(msme_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON public.kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_invoice_id ON public.disputes(invoice_id);

-- 9. Triggers for updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_kyc_requests_updated_at ON public.kyc_requests;
CREATE TRIGGER set_kyc_requests_updated_at BEFORE UPDATE ON public.kyc_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_platform_settings_updated_at ON public.platform_settings;
CREATE TRIGGER set_platform_settings_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_repayments_updated_at ON public.repayments;
CREATE TRIGGER set_repayments_updated_at BEFORE UPDATE ON public.repayments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Seed/Upsert Platform Settings
INSERT INTO public.platform_settings (key, value)
VALUES 
  ('default_discount_rate', '0.145'::jsonb),
  ('default_credit_limit', '5000000'::jsonb)
ON CONFLICT (key) DO NOTHING;
