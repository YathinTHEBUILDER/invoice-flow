-- Custom migration to fix schema drift identified in production
-- This aligns the DB with the current src/db/schema.ts

-- 1. Fix funding_requests
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funding_requests' AND column_name='interest_rate') THEN
        ALTER TABLE public.funding_requests RENAME COLUMN interest_rate TO yield_rate;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funding_requests' AND column_name='funding_deadline') THEN
        ALTER TABLE public.funding_requests ADD COLUMN funding_deadline TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days');
    END IF;
END $$;

-- 2. Add missing values to funding_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'funding_status' AND e.enumlabel = 'open') THEN
        ALTER TYPE public.funding_status ADD VALUE 'open';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'funding_status' AND e.enumlabel = 'filled') THEN
        ALTER TYPE public.funding_status ADD VALUE 'filled';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'funding_status' AND e.enumlabel = 'cancelled') THEN
        ALTER TYPE public.funding_status ADD VALUE 'cancelled';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'funding_status' AND e.enumlabel = 'completed') THEN
        ALTER TYPE public.funding_status ADD VALUE 'completed';
    END IF;
END $$;

-- 3. Fix invoices columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='verified_by') THEN
        ALTER TABLE public.invoices ADD COLUMN verified_by UUID REFERENCES public.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='updated_at') THEN
        ALTER TABLE public.invoices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- 4. Create missing tables
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id) NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data TEXT,
    new_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fraud_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    flagged_by UUID REFERENCES public.users(id) NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    reference_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'other' NOT NULL,
    status TEXT DEFAULT 'open' NOT NULL,
    resolved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
