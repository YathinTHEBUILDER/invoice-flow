-- ==========================================
-- INVOICEFLOW DATABASE RESET SCRIPT
-- ==========================================
-- This script will drop all objects in the public schema.
-- It PRESERVES the auth schema (managed by Supabase).
-- Run this in the Supabase SQL Editor.

-- 1. Drop all triggers in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON public.' || r.event_object_table || ' CASCADE';
    END LOOP;
END $$;

-- 2. Drop all functions in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || r.routine_name || ' CASCADE';
    END LOOP;
END $$;

-- 3. Drop all tables in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || r.table_name || ' CASCADE';
    END LOOP;
END $$;

-- 4. Drop all custom types in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || r.typname || ' CASCADE';
    END LOOP;
END $$;

-- 5. Drop all views in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || r.table_name || ' CASCADE';
    END LOOP;
END $$;

-- 6. Recreate public schema (optional cleanup)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

-- ==========================================
-- RESET COMPLETE
-- ==========================================
