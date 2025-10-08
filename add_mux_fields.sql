-- Add Mux fields to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS "muxPlaybackId" TEXT,
ADD COLUMN IF NOT EXISTS "muxAssetId" TEXT;
