-- ==========================================
-- PURGE LEGACY AI & AUTOMATION SETTINGS
-- ==========================================

-- Remove legacy AI/Automation setting keys to align with manual operational model
DELETE FROM public.platform_settings 
WHERE key IN ('auto_kyc_enabled', 'risk_funding_limits');

-- Ensure no future default inserts include these keys
-- (This effectively updates the initialization logic for fresh databases)
