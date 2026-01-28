-- ControlEvidence AI - Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: evidence_items
-- Stores uploaded evidence artifacts
-- =============================================
CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  detected_evidence_type TEXT,
  project_control_id UUID,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'validating', 'validated', 'failed'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_evidence_items_status ON evidence_items(status);
CREATE INDEX IF NOT EXISTS idx_evidence_items_uploaded_at ON evidence_items(uploaded_at DESC);

-- =============================================
-- Table: ai_validation_results
-- Stores AI analysis results for evidence items
-- =============================================
CREATE TABLE IF NOT EXISTS ai_validation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_item_id UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
  result_json JSONB NOT NULL,
  model_used TEXT NOT NULL,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for faster lookups
  CONSTRAINT fk_evidence_item FOREIGN KEY (evidence_item_id) 
    REFERENCES evidence_items(id) ON DELETE CASCADE
);

-- Index for faster queries by evidence item
CREATE INDEX IF NOT EXISTS idx_validation_results_evidence_item 
  ON ai_validation_results(evidence_item_id);
CREATE INDEX IF NOT EXISTS idx_validation_results_created_at 
  ON ai_validation_results(created_at DESC);

-- =============================================
-- Table: frameworks (optional, for control catalog)
-- =============================================
CREATE TABLE IF NOT EXISTS frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  version TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default frameworks
INSERT INTO frameworks (name, version, description) VALUES
  ('SOC 2', 'Type II', 'Service Organization Control 2 - Trust Services Criteria'),
  ('ISO 27001', '2022', 'Information Security Management System'),
  ('SOX ITGC', '2024', 'Sarbanes-Oxley IT General Controls'),
  ('NIST CSF', '2.0', 'Cybersecurity Framework')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- Storage Bucket Setup
-- Run this separately or via Supabase Dashboard
-- =============================================
-- Note: Create a storage bucket called 'evidence' via:
-- 1. Supabase Dashboard > Storage > New Bucket
-- 2. Name: evidence
-- 3. Public: No (private bucket)

-- =============================================
-- Row Level Security (Optional - for multi-tenant)
-- =============================================
-- ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_validation_results ENABLE ROW LEVEL SECURITY;

-- Example policy for authenticated users
-- CREATE POLICY "Users can view their own evidence" ON evidence_items
--   FOR SELECT USING (auth.uid()::text = uploaded_by);
