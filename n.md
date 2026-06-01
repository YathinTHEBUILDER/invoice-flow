
# InvoiceFlow Full Security Hardening Master Prompt

You are working on my existing repo:

`YathinTHEBUILDER/invoice-flow`

InvoiceFlow is a Next.js + Supabase fintech-style invoice discounting marketplace for Indian MSMEs and individual investors.

Your task is to perform a full security hardening pass based on a prior vulnerability audit.

Do **not** rebuild the app from scratch.  
Do **not** add unnecessary features.  
Do **not** break existing auth, dashboards, Supabase, or role-based flows.

Focus only on fixing real security risks.

---

# Core Objective

Fix all critical and high-priority security vulnerabilities in the project.

The biggest problems to fix are:

1. Public signup currently allows `admin`.
2. Admin authorization relies on user metadata.
3. `profiles` table is publicly readable.
4. Users may be able to update sensitive profile columns.
5. KYC and invoice documents may be exposed through public URLs.
6. `SECURITY DEFINER` RPCs trust passed user IDs.
7. Admin route is publicly discoverable and weakly protected.
8. Rate limiter is in-memory and weak on serverless.
9. Notification and profile update actions need stronger ownership checks.
10. Financial/admin state transitions should be more atomic.

---

# Important Rules

## Do not use unsafe shortcuts

Do not rely on:

```txt
user_metadata.role
raw_user_meta_data.role
hidden admin URLs
frontend-only role checks
UI restrictions as security
public storage URLs for private documents
broad RLS policies
````

## Security must be enforced in this order

```txt
1. Database RLS and RPC validation
2. Server actions
3. Middleware/layout route protection
4. Frontend UI
```

Frontend checks are only convenience. They are not security.

---

# Part 1 — Remove Public Admin Signup

## Problem

The signup schema currently allows:

```ts
role: z.enum(["msme", "investor", "admin"])
```

This is unsafe.

## Required fix

Update public signup to allow only:

```ts
role: z.enum(["msme", "investor"])
```

Search files:

```txt
src/app/actions/auth.ts
src/components/auth/auth-form.tsx
src/app/signup/page.tsx
src/app/get-started/page.tsx
```

Remove any public option to create an admin account.

Admin accounts must never be created through public signup.

---

# Part 2 — Create Secure Admin Allowlist

## Problem

Admin checks currently rely on `raw_user_meta_data`, `user_metadata`, or `profiles.role`.

This is unsafe.

## Required fix

Create a Supabase migration:

```txt
supabase/migrations/20260601000000_security_hardening.sql
```

Add:

```sql
-- Admin allowlist table
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

-- Only admins can view admin allowlist
drop policy if exists "Admins can view admin users" on public.admin_users;

create policy "Admins can view admin users"
on public.admin_users
for select
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

-- Safe admin checker
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;
```

## Required code changes

Update all admin checks to use:

```ts
const { data, error } = await supabase.rpc("is_admin");

if (error || data !== true) {
  throw new Error("Unauthorized: Admin access required");
}
```

Update:

```txt
src/app/actions/admin.ts
src/proxy.ts
src/app/(dashboard)/layout.tsx
any file that checks admin role
```

Remove fallback checks like:

```ts
user.user_metadata.role
user.app_metadata.role
raw_user_meta_data.role
```

For now, route middleware may use metadata only for redirect convenience, but every sensitive server action must use `rpc("is_admin")`.

---

# Part 3 — Harden Signup Trigger

## Problem

The Supabase trigger creates profile role from user metadata:

```sql
NEW.raw_user_meta_data->>'role'
```

This can create admin profiles.

## Required fix

In the new migration, replace `handle_new_user()` with a safe version:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  safe_role public.user_role;
begin
  safe_role :=
    case
      when new.raw_user_meta_data->>'role' = 'msme'
        then 'msme'::public.user_role
      when new.raw_user_meta_data->>'role' = 'investor'
        then 'investor'::public.user_role
      else 'investor'::public.user_role
    end;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    company_name,
    kyc_status,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    safe_role,
    new.raw_user_meta_data->>'company_name',
    'not_started',
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    company_name = excluded.company_name,
    updated_at = now();

  return new;
end;
$$;
```

Important:

Do **not** update `role` on conflict from user metadata.

---

# Part 4 — Lock Down Profiles RLS

## Problem

`profiles` is publicly readable and contains sensitive fields:

```txt
email
PAN
GSTIN
bank_account_no
IFSC
company_address
kyc_status
wallet_balance
locked_balance
role
```

## Required fix

In the security migration, drop unsafe policies:

```sql
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
```

Create safer policies:

```sql
create policy "Users can view own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "Admins can view all profiles"
on public.profiles
for select
using (public.is_admin());

create policy "Admins can update all profiles"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());
```

Do not allow users to update `profiles` directly through Supabase RLS.

User profile updates must go through controlled server actions.

---

# Part 5 — Safe User Profile Updates

## Problem

Users may be able to update sensitive columns like:

```txt
role
kyc_status
wallet_balance
locked_balance
```

## Required fix

Keep `updateProfileAction`, but ensure it only updates safe user-editable fields:

```txt
full_name
company_name
company_address
gstin
pan
bank_account_no
ifsc_code
```

Do not allow:

```txt
role
kyc_status
wallet_balance
locked_balance
email
created_at
admin fields
```

Because direct user RLS update is removed, the server action must use a safe RPC or service role only after validating `auth.uid()`.

Preferred approach:

Create RPC:

```sql
create or replace function public.update_own_profile_details(
  p_full_name text,
  p_company_name text,
  p_company_address text,
  p_gstin text,
  p_pan text,
  p_bank_account_no text,
  p_ifsc_code text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  update public.profiles
  set
    full_name = p_full_name,
    company_name = p_company_name,
    company_address = p_company_address,
    gstin = p_gstin,
    pan = p_pan,
    bank_account_no = p_bank_account_no,
    ifsc_code = p_ifsc_code,
    updated_at = now()
  where id = auth.uid();
end;
$$;
```

Then update `updateProfileAction` to call this RPC instead of direct table update.

---

# Part 6 — Private Storage for KYC and Invoice Documents

## Problem

KYC and invoice documents currently use or fall back to public URLs.

This is unsafe.

## Required rules

KYC documents and invoice PDFs must never be public.

Use private buckets:

```txt
kyc-documents
invoices
```

Standardize bucket names. Use only:

```txt
kyc-documents
invoice-documents
```

or keep existing names but remove mixed use of:

```txt
kyc-documents
kyc_documents
```

Pick one name and use it everywhere.

## Required code changes

Search for:

```txt
getPublicUrl
storage/v1/object/public
publicUrl
kyc_documents
kyc-documents
invoices
```

Fix all KYC and invoice file handling.

For upload:

Store only storage paths:

```ts
documents: {
  pan_path: uploadedPath,
  aadhaar_path: uploadedPath,
  invoice_path: uploadedPath
}
```

Do not store public URLs.

For admin viewing:

Generate signed URLs server-side only after admin verification:

```ts
const { data } = await supabaseAdmin.storage
  .from("kyc-documents")
  .createSignedUrl(path, 300);
```

Use short expiry:

```txt
300 seconds or 600 seconds
```

Remove all fallback logic that creates public URLs.

Never do this:

```ts
getPublicUrl(path)
```

for KYC, invoices, bank proof, Aadhaar, PAN, address proof, or business documents.

---

# Part 7 — Harden SECURITY DEFINER RPCs

## Problem

RPCs such as:

```txt
invest_in_invoice
create_withdrawal_request
disburse_to_msme
```

accept user IDs as parameters and run as `SECURITY DEFINER`.

That is unsafe unless they validate `auth.uid()` internally.

## Required fix

Update every `SECURITY DEFINER` function to:

1. Set a safe search path.
2. Validate caller identity.
3. Validate role.
4. Validate KYC where required.
5. Validate admin where required.
6. Never trust passed user IDs alone.

Search all migrations for:

```txt
SECURITY DEFINER
```

Patch every function.

---

## `invest_in_invoice`

Current unsafe signature:

```sql
invest_in_invoice(p_investor_id uuid, p_invoice_id uuid, p_amount numeric)
```

Better signature:

```sql
invest_in_invoice(p_invoice_id uuid, p_amount numeric)
```

Inside function:

```sql
v_investor_id := auth.uid();

if v_investor_id is null then
  raise exception 'Unauthorized';
end if;
```

Then fetch profile:

```sql
select wallet_balance, role, kyc_status
into v_wallet_balance, v_role, v_kyc_status
from public.profiles
where id = v_investor_id
for update;

if v_role <> 'investor' then
  raise exception 'Only investors can fund invoices';
end if;

if v_kyc_status <> 'verified' then
  raise exception 'KYC verification required';
end if;
```

Do not accept investor ID from client.

Update server action accordingly:

```ts
await supabase.rpc("invest_in_invoice", {
  p_invoice_id: invoiceId,
  p_amount: amount
});
```

---

## `create_withdrawal_request`

Current unsafe signature accepts:

```sql
p_user_id uuid
```

Better signature:

```sql
create_withdrawal_request(p_amount numeric, p_description text)
```

Inside function:

```sql
v_user_id := auth.uid();

if v_user_id is null then
  raise exception 'Unauthorized';
end if;
```

Do not accept user ID from client.

---

## Admin RPCs

For admin-only RPCs such as:

```txt
disburse_to_msme
approve_invoice
reject_invoice
approve_kyc
reject_kyc
verify_settlement
```

Always add:

```sql
if not public.is_admin() then
  raise exception 'Admin only';
end if;
```

---

# Part 8 — Make Critical Admin Actions Atomic

## Problem

Admin actions currently perform multi-step updates in TypeScript:

```txt
update profile
update KYC request
insert transaction
insert audit log
send notification
```

If one step fails, database state can become inconsistent.

## Required fix

Move these into RPCs:

```txt
approve_kyc_request
reject_kyc_request
approve_invoice_request
reject_invoice_request
verify_settlement_request
```

Each RPC must:

```txt
- validate admin inside the RPC
- update related rows
- insert audit log
- return structured result
- fail atomically
```

Notifications can be created after RPC success.

Prioritize:

```txt
approveKYCAction
rejectKYCAction
approveInvoiceAction
rejectInvoiceAction
verifySettlementAction
```

---

# Part 9 — Harden Notification Actions

## Problem

`markAsRead(notificationId)` updates by ID without explicit user ownership check in code.

## Required fix

Update:

```txt
src/app/actions/notifications.ts
```

Use:

```ts
export async function markAsRead(notificationId: string) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  return { success: true };
}
```

Also standardize notification schema.

Use only:

```txt
is_read
```

Do not use both:

```txt
read
is_read
```

Create migration:

```sql
alter table public.notifications
add column if not exists is_read boolean default false;

update public.notifications
set is_read = coalesce(is_read, false);

alter table public.notifications
add column if not exists link text;
```

If `read` exists and is safe to drop:

```sql
alter table public.notifications drop column if exists read;
```

---

# Part 10 — Harden Support Tickets

## Problem

Support ticket fields like priority/category may be arbitrary strings.

## Required fix

In server action, validate:

```ts
const supportTicketSchema = z.object({
  subject: z.string().min(5).max(120),
  message: z.string().min(10).max(3000),
  category: z.enum(["invoice", "kyc", "repayment", "technical", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});
```

Add DB constraints:

```sql
alter table public.support_tickets
drop constraint if exists support_tickets_priority_check;

alter table public.support_tickets
add constraint support_tickets_priority_check
check (priority in ('low', 'medium', 'high', 'urgent'));

alter table public.support_tickets
drop constraint if exists support_tickets_category_check;

alter table public.support_tickets
add constraint support_tickets_category_check
check (category in ('invoice', 'kyc', 'repayment', 'technical', 'other'));
```

---

# Part 11 — Harden Repayment and Dispute Ownership

## Required rule

Any action that updates a repayment, dispute, invoice, or support ticket by ID must verify ownership.

For MSME repayment proof:

```txt
repayment.invoice_id → invoices.msme_id must equal auth.uid()
```

For disputes:

```txt
invoice.msme_id must equal auth.uid()
```

For support tickets:

```txt
support_tickets.user_id must equal auth.uid()
```

Do not rely only on RLS.

Add explicit checks in:

```txt
src/app/actions/msme.ts
src/app/actions/investor.ts
src/app/actions/admin.ts
```

---

# Part 12 — Replace In-Memory Rate Limiter

## Problem

The current rate limiter uses an in-memory `Map`, which is weak on Vercel/serverless.

## Required fix

Replace `src/lib/rate-limit.ts` with a Supabase-backed limiter or Redis-backed limiter.

Because this project should stay low-cost/free, prefer Supabase table-based limiter.

Create migration:

```sql
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  expires_at timestamptz not null
);

alter table public.rate_limits enable row level security;

-- No public policies. Access only through service/server-side RPC.
```

Create RPC:

```sql
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_record public.rate_limits%rowtype;
begin
  select *
  into v_record
  from public.rate_limits
  where key = p_key
  for update;

  if not found or v_record.expires_at < v_now then
    insert into public.rate_limits(key, count, expires_at)
    values (p_key, 1, v_now + make_interval(secs => p_window_seconds))
    on conflict (key) do update
    set count = 1,
        expires_at = excluded.expires_at;

    return jsonb_build_object('success', true, 'remaining', p_limit - 1);
  end if;

  if v_record.count >= p_limit then
    return jsonb_build_object('success', false, 'remaining', 0);
  end if;

  update public.rate_limits
  set count = count + 1
  where key = p_key;

  return jsonb_build_object('success', true, 'remaining', p_limit - v_record.count - 1);
end;
$$;
```

Update `src/lib/rate-limit.ts` to call this RPC server-side.

---

# Part 13 — Harden Middleware / Proxy

## Current issue

Middleware uses:

```ts
user.user_metadata.role
```

This should not be used as authority.

## Required fix

Middleware should only enforce authentication and redirect convenience.

For dashboard layouts, use server-side secure role checks.

Recommended:

```txt
- Middleware checks if logged in.
- Dashboard layout fetches profile safely.
- Admin pages call secure `ensureAdmin()`.
- Sensitive server actions call `rpc("is_admin")`.
```

If using role in middleware, treat it as non-authoritative only.

---

# Part 14 — Remove or Harden Secret Admin Login

## Problem

`/secret-admin-login` is public and discoverable.

## Required fix

Options:

### Preferred

Remove `/secret-admin-login` and use normal `/login` with admin allowlist.

### Acceptable

Keep it, but harden:

```txt
- no public links to it
- stricter rate limits
- generic error messages
- audit failed login attempts
- require admin allowlist after login
- redirect non-admin users away
```

Do not rely on the route being “secret.”

---

# Part 15 — Add Security Headers

Add security headers in `next.config.ts` if not already present.

Recommended starter:

```ts
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

Do not add a strict CSP immediately if it breaks inline styles/scripts. Add CSP only after testing.

---

# Part 16 — Add Dependency Security Workflow

Add GitHub Dependabot:

```txt
.github/dependabot.yml
```

Content:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

Add a basic audit script to `package.json`:

```json
"security:audit": "npm audit"
```

Do not blindly run `npm audit fix --force`.

---

# Part 17 — Required Search Audit

Before finishing, search the repo for unsafe terms and fix them:

```txt
admin
user_metadata
raw_user_meta_data
app_metadata
is_admin
getPublicUrl
storage/v1/object/public
SECURITY DEFINER
p_user_id
p_investor_id
role: z.enum
Public profiles are viewable
Users can update their own profile
read BOOLEAN
is_read
secret-admin-login
```

For each occurrence, decide whether it is safe or must be replaced.

---

# Part 18 — Manual Supabase Checklist

Some settings may need to be changed manually in Supabase dashboard.

After code changes, provide instructions for:

```txt
1. Make KYC bucket private.
2. Make invoice document bucket private.
3. Remove old public buckets if unused.
4. Add the real admin user to public.admin_users.
5. Confirm RLS is enabled on all sensitive tables.
6. Confirm no public select policy exists on profiles.
7. Confirm anon users cannot read profiles.
8. Confirm anon users cannot call privileged RPCs.
```

Include SQL for adding the first admin:

```sql
insert into public.admin_users (user_id)
values ('REPLACE_WITH_ADMIN_USER_UUID')
on conflict do nothing;
```

Do not hardcode my UUID.

---

# Part 19 — Testing Checklist

After implementation, test these cases.

## Auth tests

```txt
Public signup cannot create admin.
MSME signup works.
Investor signup works.
Admin login only works for users in admin_users table.
Non-admin cannot access admin actions.
```

## RLS tests

```txt
User A cannot read User B profile.
User A cannot read User B KYC request.
User A cannot read User B transactions.
User A cannot read User B notifications.
User A cannot update role.
User A cannot update kyc_status.
User A cannot update wallet_balance.
```

## Storage tests

```txt
KYC file public URL does not work.
Invoice file public URL does not work.
Admin signed URL works temporarily.
Signed URL expires.
Normal user cannot access another user’s KYC document.
```

## RPC tests

```txt
Investor cannot pass another investor ID.
Investor cannot invest before KYC.
MSME cannot call investor RPC.
Non-admin cannot call admin RPC.
Admin-only RPC fails for normal users.
Withdrawal cannot be created for another user.
```

## Server action tests

```txt
markAsRead only updates own notification.
support tickets validate category and priority.
repayment proof validates invoice ownership.
dispute creation validates invoice ownership.
```

## Build tests

Run:

```bash
npm run lint
npm run build
npm run security:audit
```

Fix all errors.

---

# Final Output Required

When done, provide:

1. Summary of security issues fixed.
2. Files changed.
3. New migrations added.
4. RLS policies changed.
5. RPCs hardened.
6. Storage behavior changed.
7. Auth/admin changes made.
8. Manual Supabase steps still required.
9. Test results.
10. Any remaining risks or TODOs.

---

# Important Final Requirement

Do not claim the project is production-ready unless all tests pass.

Final security target:

```txt
No public admin signup.
No metadata-based admin authorization.
No public profile reads.
No broad user profile updates.
No public KYC/invoice documents.
No unsafe SECURITY DEFINER RPCs.
No user-controlled wallet/role/KYC updates.
```

```

Use this as a **single master prompt**. It tells the coding agent exactly what to fix, where to look, and what not to break.
```
