-- ==========================================
-- EXHAUSTIVE PURGE OF AI & AUTOMATED REMNANTS
-- ==========================================

-- Remove any potentially seeded AI, smart, or automated configuration keys
DELETE FROM public.platform_settings 
WHERE key IN (
    'auto_kyc_enabled', 
    'risk_funding_limits',
    'fraud_detection_sensitivity',
    'predictive_yield_enabled',
    'smart_matching_algorithm',
    'automated_dispute_resolution',
    'ai_risk_scoring_engine'
);

-- Ensure the system only relies on manual operational settings
-- Currently expected keys: 'platform_commission', 'preclosure_penalty'
