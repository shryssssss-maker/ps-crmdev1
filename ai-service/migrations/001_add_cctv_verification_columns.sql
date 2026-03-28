-- Migration: Add CCTV Verification Columns
-- Created: 2026-03-27
-- Purpose: Add verification tracking columns to cctv_cameras table

-- Add verification tracking columns to cctv_cameras table
ALTER TABLE cctv_cameras
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT NULL CHECK (verification_status IS NULL OR verification_status IN ('pending', 'repaired', 'not_repaired')),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verified_by UUID DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN cctv_cameras.verification_status IS 'CCTV verification result: pending, repaired, or not_repaired';
COMMENT ON COLUMN cctv_cameras.verified_at IS 'Timestamp when verification was completed';
COMMENT ON COLUMN cctv_cameras.verified_by IS 'User ID of the person who performed the verification';

-- Add verification result columns to complaints table for tracking from ticket side
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS cctv_verification_status TEXT DEFAULT NULL CHECK (cctv_verification_status IS NULL OR cctv_verification_status IN ('pending', 'repaired', 'not_repaired')),
ADD COLUMN IF NOT EXISTS cctv_verified_at TIMESTAMP DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN complaints.cctv_verification_status IS 'CCTV verification result for tickets originating from cctv source';
COMMENT ON COLUMN complaints.cctv_verified_at IS 'Timestamp when CCTV verification was completed for this ticket';

-- Create index for quick lookups of cameras pending verification
CREATE INDEX IF NOT EXISTS idx_cctv_cameras_verification_status
ON cctv_cameras(verification_status, verified_at DESC)
WHERE verification_status = 'pending';

-- Create index for complaints with CCTV verification
-- Note: CCTV auto-tickets use source = 'system' (not 'cctv', which is not a valid enum value)
CREATE INDEX IF NOT EXISTS idx_complaints_cctv_verification
ON complaints(cctv_verification_status, cctv_verified_at DESC)
WHERE source = 'system' AND cctv_verification_status = 'pending';
