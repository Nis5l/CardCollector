-- Migration to add image hash columns for MediaManager integration
-- Run this migration to enable hash-based image storage

-- Add profile image hash to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS uprofileimage VARCHAR(64) NULL;

-- Add collector image and banner hashes to collectors table
ALTER TABLE collectors
ADD COLUMN IF NOT EXISTS coimage VARCHAR(64) NULL,
ADD COLUMN IF NOT EXISTS cobanner VARCHAR(64) NULL;

-- Add card image hash to cards table
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS cimage VARCHAR(64) NULL;
