-- Suggested performance indexes for faster querying on dashboards and marketplace

create index if not exists idx_invoices_msme_created
on public.invoices (msme_id, created_at desc);

create index if not exists idx_invoices_status_created
on public.invoices (status, created_at desc);

create index if not exists idx_invoices_msme_status_created
on public.invoices (msme_id, status, created_at desc);

create index if not exists idx_investments_investor_created
on public.investments (investor_id, created_at desc);

create index if not exists idx_investments_invoice
on public.investments (invoice_id);

create index if not exists idx_transactions_user_created
on public.transactions (user_id, created_at desc);

create index if not exists idx_notifications_user_created
on public.notifications (user_id, created_at desc);

create index if not exists idx_kyc_requests_user
on public.kyc_requests (user_id);

create index if not exists idx_kyc_requests_status_created
on public.kyc_requests (status, created_at desc);

create index if not exists idx_repayments_invoice
on public.repayments (invoice_id);

create index if not exists idx_repayments_status_updated
on public.repayments (status, updated_at desc);

create index if not exists idx_support_tickets_user_created
on public.support_tickets (user_id, created_at desc);

create index if not exists idx_support_tickets_status_created
on public.support_tickets (status, created_at desc);
