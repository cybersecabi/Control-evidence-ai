-- ControlEvidence AI - Authentication & Row Level Security Migration
-- Run this migration after 001_initial_schema.sql

-- =============================================
-- Update uploaded_by column to store user UUIDs
-- =============================================
-- Note: If you have existing data, you may need to handle migration of
-- existing 'anonymous' or text values to proper UUIDs

-- Alter the column type to UUID if it's currently TEXT
-- This will fail if there's existing non-UUID data
-- ALTER TABLE evidence_items ALTER COLUMN uploaded_by TYPE UUID USING uploaded_by::uuid;

-- Alternative: Keep as TEXT to store user.id strings
-- The uploaded_by column already exists as TEXT, which works with auth.uid()::text

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_validation_results ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Evidence Items Policies
-- =============================================

-- Policy: Users can view their own evidence
CREATE POLICY "Users can view own evidence" ON evidence_items
    FOR SELECT
    USING (auth.uid()::text = uploaded_by);

-- Policy: Users can insert their own evidence  
CREATE POLICY "Users can insert own evidence" ON evidence_items
    FOR INSERT
    WITH CHECK (auth.uid()::text = uploaded_by);

-- Policy: Users can update their own evidence
CREATE POLICY "Users can update own evidence" ON evidence_items
    FOR UPDATE
    USING (auth.uid()::text = uploaded_by);

-- Policy: Users can delete their own evidence
CREATE POLICY "Users can delete own evidence" ON evidence_items
    FOR DELETE
    USING (auth.uid()::text = uploaded_by);

-- =============================================
-- AI Validation Results Policies
-- =============================================

-- Policy: Users can view validation results for their own evidence
CREATE POLICY "Users can view own validation results" ON ai_validation_results
    FOR SELECT
    USING (
        evidence_item_id IN (
            SELECT id FROM evidence_items 
            WHERE uploaded_by = auth.uid()::text
        )
    );

-- Policy: Service role can insert validation results (for API routes)
-- Note: Service role bypasses RLS, so this is mainly for documentation

-- =============================================
-- Index for efficient RLS queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_evidence_items_uploaded_by 
    ON evidence_items(uploaded_by);
