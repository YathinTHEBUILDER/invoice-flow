-- Add unique constraint to repayments(invoice_id) to support ON CONFLICT in RPCs
ALTER TABLE public.repayments ADD CONSTRAINT repayments_invoice_id_unique UNIQUE (invoice_id);
