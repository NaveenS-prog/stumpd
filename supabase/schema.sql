-- ==============================================================================
-- Stumpd Universal Leaderboard Schema
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create the universal_leaderboard table
CREATE TABLE IF NOT EXISTS public.universal_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL CHECK (char_length(team_name) <= 60),
    creator_name TEXT CHECK (char_length(creator_name) <= 40),
    mode TEXT NOT NULL DEFAULT 'Standard',
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 1000),
    grade TEXT NOT NULL CHECK (grade IN ('S+', 'S', 'A', 'B', 'C', 'D')),
    matches_won INTEGER NOT NULL DEFAULT 0 CHECK (matches_won >= 0 AND matches_won <= 20),
    total_matches INTEGER NOT NULL DEFAULT 7 CHECK (total_matches >= 1),
    captain_name TEXT NOT NULL,
    synergies_count INTEGER NOT NULL DEFAULT 0,
    is_invincible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create high-performance index for leaderboard querying
CREATE INDEX IF NOT EXISTS idx_universal_leaderboard_score_date 
ON public.universal_leaderboard (total_score DESC, created_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.universal_leaderboard ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies
-- Allow anyone (including anonymous players) to view the global leaderboard
DROP POLICY IF EXISTS "Allow public read access" ON public.universal_leaderboard;
CREATE POLICY "Allow public read access"
ON public.universal_leaderboard
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to submit a finished team score (validated by CHECK constraints)
DROP POLICY IF EXISTS "Allow public score submission" ON public.universal_leaderboard;
CREATE POLICY "Allow public score submission"
ON public.universal_leaderboard
FOR INSERT
TO anon, authenticated
WITH CHECK (
    char_length(team_name) >= 1 AND
    char_length(team_name) <= 60 AND
    total_score >= 0 AND
    total_score <= 1000
);

-- Explicitly grant table permissions to anon and authenticated roles
GRANT SELECT, INSERT ON public.universal_leaderboard TO anon, authenticated;
