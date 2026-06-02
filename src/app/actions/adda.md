
# InvoiceFlow Performance, Asset Loading, Caching & Realtime Reflection Master Prompt

You are working on my existing repo:

`YathinTHEBUILDER/invoice-flow`

InvoiceFlow is a Next.js + Supabase invoice discounting platform with role-based dashboards for:

- Admin
- MSME
- Investor

The current problem is that updates feel slow. When something changes, the UI takes around 5–6 seconds to reflect the change. Asset loading, dashboard data updates, and post-mutation refreshes feel delayed.

Your task is to improve speed, caching, realtime reflection, and perceived performance across the entire website without breaking security, auth, Supabase RLS, or existing dashboard flows.

Do **not** rebuild the project from scratch.

---

# Main Goal

Make InvoiceFlow feel fast.

After this upgrade:

```txt
- Dashboard updates should reflect almost instantly.
- Pages should not fully reload after every action.
- Data should remain visible while refreshing.
- Invoice uploads should appear immediately.
- Admin approvals should reflect on MSME and Investor dashboards in realtime.
- Wallet, notification, invoice, KYC, and marketplace states should update faster.
- Static assets should load faster.
- Heavy components should be lazy-loaded.
- Public pages should use safe caching.
- Dashboard pages should use client-side caching + realtime updates.
````

---

# Core Performance Strategy

Use this architecture:

```txt
Public landing pages:
- Server components where possible
- Static rendering / ISR where safe
- Optimized images
- Long-lived static asset cache
- Lazy-load heavy animations

Dashboards:
- TanStack Query / React Query cache
- Supabase Realtime subscriptions
- Optimistic UI for safe actions
- Row-level loading states
- No full-page refresh after mutations
- Minimal revalidatePath usage

Financial actions:
- Server Actions + Supabase RPC
- No unsafe optimistic final balance
- Show instant “Processing…” state
- Confirm final state only after server success
```

---

# Part 1 — Install TanStack Query

Add TanStack Query if not installed:

```bash
npm install @tanstack/react-query
```

Create:

```txt
src/components/providers/query-provider.tsx
```

Use:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Wrap the dashboard layout or root layout with this provider.

Do not break existing providers, themes, auth, or layout structure.

---

# Part 2 — Replace Manual Dashboard Fetching With Query Cache

Find dashboard pages using this pattern:

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);
```

Replace with TanStack Query.

Prioritize these files:

```txt
src/app/(dashboard)/msme/invoices/page.tsx
src/app/(dashboard)/msme/kyc/page.tsx
src/app/(dashboard)/msme/repayments/page.tsx
src/app/(dashboard)/investor/page.tsx
src/app/(dashboard)/investor/wallet/page.tsx
src/app/(dashboard)/investor/portfolio/page.tsx
src/app/(dashboard)/admin/page.tsx
src/components/NotificationBell.tsx
```

Use stable query keys:

```tsx
["msme-invoices", userId]
["msme-stats", userId]
["msme-repayments", userId]
["investor-stats", userId]
["investor-wallet", userId]
["investor-portfolio", userId]
["marketplace-invoices"]
["admin-stats"]
["admin-kyc-queue"]
["admin-invoice-queue"]
["notifications", userId]
```

Important UX rule:

```txt
Never blank the entire page while refetching.
Keep previous data visible.
Show small refresh indicators only where needed.
```

Use:

```tsx
isLoading
isFetching
isPending
```

properly.

---

# Part 3 — Optimistic UI For Safe Actions

Add optimistic UI where it is safe.

Safe optimistic actions:

```txt
- Upload invoice
- Submit KYC request visual state
- Raise support ticket
- Submit repayment proof visual state
- Mark notification as read
- Local search/filter changes
```

Do **not** permanently optimistic-update sensitive financial values like wallet balance, investment amount, or repayment completion before server confirmation.

---

## Invoice Upload Optimistic UI

Current issue:

```txt
User uploads invoice
Server action runs
Notifications run
revalidatePath runs
fetchInvoices runs again
UI updates late
```

Required behavior:

```txt
User clicks submit
Temporary invoice appears immediately with status “Submitting”
Server confirms
Temporary row is replaced with DB row
If server fails
Temporary row disappears and error toast appears
```

Example implementation:

```tsx
const tempInvoice = {
  id: `temp-${Date.now()}`,
  invoice_number: formData.get("invoice_number") || autoInvoiceNumber,
  amount: Number(formData.get("amount")),
  buyer_name: formData.get("buyer_name"),
  status: "submitting",
  created_at: new Date().toISOString(),
  isOptimistic: true,
};

queryClient.setQueryData(["msme-invoices", userId], (old: any[] = []) => [
  tempInvoice,
  ...old,
]);

const result = await uploadInvoiceAction(formData);

if (result.success) {
  queryClient.setQueryData(["msme-invoices", userId], (old: any[] = []) =>
    old.map((invoice) =>
      invoice.id === tempInvoice.id ? result.data[0] : invoice
    )
  );
} else {
  queryClient.setQueryData(["msme-invoices", userId], (old: any[] = []) =>
    old.filter((invoice) => invoice.id !== tempInvoice.id)
  );
}
```

Display optimistic status badge:

```txt
Submitting...
```

Once real DB row arrives:

```txt
Under Review
```

---

# Part 4 — Supabase Realtime Subscriptions

Add realtime subscriptions for dashboard data.

Create reusable hooks:

```txt
src/hooks/use-realtime-invoices.ts
src/hooks/use-realtime-notifications.ts
src/hooks/use-realtime-wallet.ts
src/hooks/use-realtime-investments.ts
src/hooks/use-realtime-admin-queues.ts
```

Each hook should:

```txt
- Subscribe on mount
- Update TanStack Query cache
- Avoid duplicate rows
- Clean up channel on unmount
- Use filters wherever possible
```

---

## MSME Invoice Realtime

Subscribe to:

```txt
table: invoices
events: INSERT, UPDATE, DELETE
filter: msme_id=eq.${userId}
```

On event:

```tsx
INSERT:
- Add row only if not already present.

UPDATE:
- Replace matching row.

DELETE:
- Remove matching row.
```

Update:

```tsx
queryClient.setQueryData(["msme-invoices", userId], ...)
queryClient.invalidateQueries({ queryKey: ["msme-stats", userId] })
```

---

## Investor Marketplace Realtime

Subscribe to:

```txt
table: invoices
events: INSERT, UPDATE, DELETE
filter/status logic for approved and partially_funded invoices
```

When an invoice becomes:

```txt
approved
partially_funded
funded
rejected
```

the marketplace should reflect it without refresh.

Update:

```tsx
["marketplace-invoices"]
["investor-stats", userId]
["investor-portfolio", userId]
```

---

## Wallet Realtime

Subscribe to:

```txt
table: profiles
event: UPDATE
filter: id=eq.${userId}
```

When wallet balance or locked balance changes, update:

```tsx
["investor-wallet", userId]
["investor-stats", userId]
["msme-stats", userId]
```

Do not use optimistic final wallet balance for real financial state. Let realtime/server success confirm it.

---

## Investments Realtime

Subscribe to:

```txt
table: investments
events: INSERT, UPDATE, DELETE
filter: investor_id=eq.${userId}
```

Update:

```tsx
["investor-portfolio", userId]
["investor-stats", userId]
```

---

## Admin Realtime

Subscribe admin dashboard to:

```txt
kyc_requests
invoices
withdrawals
support_tickets
repayments
```

Update:

```tsx
["admin-stats"]
["admin-kyc-queue"]
["admin-invoice-queue"]
["admin-settlements"]
["admin-withdrawals"]
["admin-support-tickets"]
```

Admin should not have to refresh after:

```txt
- New KYC request
- New invoice upload
- New repayment proof
- New withdrawal request
- New support ticket
```

---

## Notification Realtime

Subscribe to:

```txt
table: notifications
event: INSERT, UPDATE, DELETE
filter: user_id=eq.${userId}
```

Update:

```tsx
["notifications", userId]
```

Notification bell should update instantly.

---

# Part 5 — Reduce `revalidatePath()` Usage In Dashboards

Search for:

```txt
revalidatePath
```

Especially in:

```txt
src/app/actions/msme.ts
src/app/actions/investor.ts
src/app/actions/admin.ts
src/app/actions/notifications.ts
```

Current issue:

```txt
Mutation runs → revalidatePath → client fetches again → UI waits
```

New rule:

```txt
Public pages:
- revalidatePath is okay.

Dashboard pages:
- Prefer React Query invalidation + Supabase Realtime.
- Avoid broad revalidatePath calls after every mutation.
```

Do not remove `revalidatePath()` blindly.

For each usage:

```txt
- Remove if query cache/realtime handles it.
- Keep if it affects server-rendered public/static data.
- Document why kept or removed.
```

---

# Part 6 — Make Notifications Non-Blocking

Some actions create notifications before returning success.

This slows down user-visible updates.

Where possible:

```txt
- Complete core database mutation first.
- Return success quickly.
- Create notifications in parallel.
- Notification failure must not fail successful core action unless critical.
```

Replace:

```tsx
for (const admin of admins) {
  await createNotification(...);
}
```

with:

```tsx
await Promise.allSettled(
  admins.map((admin) =>
    createNotification(...)
  )
);
```

Use `Promise.allSettled` instead of `Promise.all` when notification failure should not break the main action.

Apply this in:

```txt
src/app/actions/msme.ts
src/app/actions/investor.ts
src/app/actions/admin.ts
```

---

# Part 7 — Parallelize Independent Fetches

Find functions that fetch multiple independent resources sequentially.

Example bad pattern:

```tsx
const invoices = await ...
const repayments = await ...
const profile = await ...
const settings = await ...
```

Replace with:

```tsx
const [invoicesResult, repaymentsResult, profileResult, settingsResult] =
  await Promise.all([
    ...,
    ...,
    ...,
    ...,
  ]);
```

Prioritize:

```txt
getMSMEStats()
getInvestorStats()
getAdminStats()
wallet dashboard fetches
admin dashboard queue fetches
```

Do not parallelize queries when one query depends on the previous result.

---

# Part 8 — Add Database Performance Indexes

Create a new migration:

```txt
supabase/migrations/20260602000000_performance_indexes.sql
```

Add safe indexes only for tables/columns that exist.

Suggested indexes:

```sql
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
```

If any table/column does not exist, skip or adjust the index.

---

# Part 9 — Optimize Static Asset Loading

Audit asset usage across:

```txt
public/
src/components/
src/app/
```

Search for:

```txt
<img
Image from "next/image"
video
svg
png
jpg
webp
gif
framer-motion
```

Required improvements:

```txt
- Use next/image for images.
- Add width and height.
- Use priority only for above-the-fold hero images.
- Use lazy loading for below-the-fold images.
- Convert large PNG/JPG to WebP/AVIF where possible.
- Avoid loading huge media in dashboard pages.
- Avoid animated GIFs; use optimized video/webp/lottie only if necessary.
- Remove unused assets.
```

For Next Image:

```tsx
<Image
  src="/path.webp"
  alt="..."
  width={1200}
  height={800}
  priority={false}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

For hero image only:

```tsx
priority
```

should be used carefully.

---

# Part 10 — Lazy Load Heavy Components

Find heavy components:

```txt
Framer Motion-heavy sections
Charts
Large dashboard tables
Modals
KYC upload forms
Marketplace cards
Admin tables
```

Use dynamic imports where appropriate:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

Use this for:

```txt
- Large modals
- Admin queue tables
- Heavy animated landing sections
- Non-critical dashboard panels
```

Do not lazy-load critical above-the-fold content unnecessarily.

---

# Part 11 — Reduce Framer Motion Cost

The site uses Framer Motion. Keep animations, but reduce unnecessary runtime cost.

Rules:

```txt
- Avoid animating hundreds of repeated cards at once.
- Use viewport once for landing animations.
- Avoid infinite animations on many elements.
- Prefer CSS transitions for simple hover effects.
- Respect reduced motion.
```

Add reduced-motion handling:

```tsx
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();
```

If reduced motion:

```txt
disable complex motion animations
```

---

# Part 12 — Improve Loading UX

Replace full-page loaders with:

```txt
- Skeleton cards
- Row-level loading
- Button-level loading
- Tiny refresh indicators
- Optimistic placeholders
```

Bad UX:

```txt
Click update → whole page freezes or reloads
```

Good UX:

```txt
Click update → button shows spinner → row says Processing → page remains usable
```

Add components if useful:

```txt
src/components/ui/skeleton-card.tsx
src/components/ui/table-row-skeleton.tsx
src/components/ui/inline-refresh-indicator.tsx
```

---

# Part 13 — Cache Static Public Pages Safely

For public landing pages, use caching where safe.

Recommended:

```txt
Homepage:
- mostly static
- cacheable
- revalidate periodically if needed

Legal pages:
- static
- cacheable

Marketing sections:
- static
- cacheable
```

Avoid caching authenticated dashboards with shared public cache.

Never cache private user-specific data globally.

Important rule:

```txt
Do not use public/static caching for user-specific dashboard data.
```

---

# Part 14 — Supabase Query Optimization

Audit Supabase queries.

Avoid:

```tsx
.select("*")
```

when only a few fields are needed.

Replace with explicit fields:

```tsx
.select("id, invoice_number, amount, status, created_at")
```

Prioritize dashboard list pages.

Examples:

```txt
Invoice table does not always need documents JSON.
Marketplace does not always need full MSME profile.
Notification bell does not need all fields if only showing count.
Admin stats should use count/head where possible.
```

Use:

```tsx
.select("*", { count: "exact", head: true })
```

for counts when row data is not needed.

---

# Part 15 — Prevent Duplicate Fetching

Audit pages for duplicate calls like:

```txt
Server action fetches data
Client useEffect fetches same data
Mutation calls revalidatePath
Client manually fetches again
Realtime also updates same data
```

Required final behavior:

```txt
Initial load: React Query fetch
Mutation: optimistic update or query invalidation
Realtime: cache patch
Manual refresh: optional user-triggered invalidation
```

Avoid doing all of them at once.

---

# Part 16 — Financial Action Reflection Rules

For financial actions:

```txt
fund invoice
add funds
withdraw funds
verify repayment
disburse payout
```

Use this UI pattern:

```txt
1. Button immediately changes to Processing.
2. Disable duplicate submit.
3. Do server action/RPC.
4. On success, show success toast.
5. Invalidate related queries.
6. Realtime confirms final wallet/investment state.
7. On failure, show error and restore button.
```

Do not permanently optimistic-update wallet balances.

---

# Part 17 — Required Files To Inspect

Inspect and optimize these files:

```txt
src/app/actions/msme.ts
src/app/actions/investor.ts
src/app/actions/admin.ts
src/app/actions/notifications.ts

src/app/(dashboard)/msme/invoices/page.tsx
src/app/(dashboard)/msme/kyc/page.tsx
src/app/(dashboard)/msme/repayments/page.tsx
src/app/(dashboard)/msme/investments/page.tsx

src/app/(dashboard)/investor/page.tsx
src/app/(dashboard)/investor/wallet/page.tsx
src/app/(dashboard)/investor/portfolio/page.tsx

src/app/(dashboard)/admin/page.tsx

src/components/NotificationBell.tsx
src/components/marketplace-portal.tsx
src/components/landing/*
src/app/page.tsx
src/app/layout.tsx
next.config.ts
```

---

# Part 18 — Next Config Caching Headers

In `next.config.ts`, add safe static asset headers if not already handled.

Example:

```ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

Do not add aggressive caching to authenticated routes.

---

# Part 19 — Manual Supabase Realtime Checklist

Realtime must be enabled in Supabase for required tables.

After code changes, provide manual instructions to enable realtime for:

```txt
invoices
investments
repayments
profiles
transactions
notifications
kyc_requests
support_tickets
withdrawals
```

Only enable what is actually needed.

Make sure RLS policies still protect user data.

Realtime must not leak other users’ records.

Use filtered subscriptions wherever possible:

```txt
user_id=eq.${userId}
msme_id=eq.${userId}
investor_id=eq.${userId}
```

Admin subscriptions should only run after secure admin verification.

---

# Part 20 — Testing Checklist

After implementation, test:

## Asset loading

```txt
Homepage loads faster.
No oversized images remain.
No unnecessary hero assets load below the fold.
Images use next/image.
Large components are lazy-loaded.
```

## Dashboard reflection

```txt
MSME invoice appears instantly after upload.
Admin sees new invoice without refresh.
Admin approval updates MSME invoice status without refresh.
Investor marketplace updates when invoice is approved.
Investor funding updates invoice funding progress without refresh.
Notification bell updates instantly.
Wallet page updates after successful transaction.
```

## Caching behavior

```txt
Returning to a dashboard page shows cached data immediately.
Refetch happens in background.
No blank page while refreshing.
Search/filter does not trigger server refetch unnecessarily.
```

## Security

```txt
No private data is globally cached.
No user-specific dashboard uses public/static cache.
Realtime subscriptions are filtered.
RLS still protects data.
No wallet balance is permanently optimistic before server confirmation.
```

## Build

Run:

```bash
npm run lint
npm run build
```

Fix all errors.

---

# Final Output Required

When done, provide:

```txt
1. Files changed
2. TanStack Query provider added
3. Pages converted from manual fetch to query cache
4. Realtime hooks added
5. Optimistic UI actions added
6. revalidatePath calls removed/kept with reason
7. Database indexes added
8. Static asset optimizations made
9. Lazy-loaded components added
10. Supabase realtime manual steps
11. Test results
12. Remaining TODOs
```

---

# Final Success Target

InvoiceFlow should feel like this:

```txt
- Public website loads quickly.
- Dashboard data appears immediately from cache.
- Mutations reflect instantly where safe.
- Admin/MSME/Investor state changes propagate in realtime.
- No full-page refresh after common actions.
- Assets are optimized and cached.
- Private dashboard data is never publicly cached.
```

```

Use this as the **single master prompt**. It focuses on faster asset loading, caching, realtime reflection, and reducing the lag you mentioned without making the finance parts unsafe.
```
