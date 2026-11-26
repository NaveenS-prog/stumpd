-- ==============================================================================
-- Stumpd Universal Leaderboard Schema (Hardened)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create the universal_leaderboard table with strict field constraints
CREATE TABLE IF NOT EXISTS public.universal_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL CHECK (char_length(team_name) >= 1 AND char_length(team_name) <= 60),
    creator_name TEXT CHECK (creator_name IS NULL OR (char_length(creator_name) >= 1 AND char_length(creator_name) <= 40)),
    mode TEXT NOT NULL DEFAULT 'International' CONSTRAINT chk_mode_valid CHECK (mode IN ('International', 'IPL', 'Daily Stumpd')),
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 1000),
    grade TEXT NOT NULL CHECK (grade IN ('S+', 'S', 'A', 'B', 'C', 'D')),
    matches_won INTEGER NOT NULL DEFAULT 1 CONSTRAINT chk_matches_won_bounds CHECK (matches_won BETWEEN 1 AND 7),
    total_matches INTEGER NOT NULL DEFAULT 7 CONSTRAINT chk_total_matches_bounds CHECK (total_matches BETWEEN 1 AND 7),
    captain_name TEXT NOT NULL CHECK (char_length(captain_name) >= 1 AND char_length(captain_name) <= 60),
    synergies_count INTEGER NOT NULL DEFAULT 0 CHECK (synergies_count >= 0 AND synergies_count <= 20),
    is_invincible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Cross-field consistency constraints to prevent client-side score spoofing
    CONSTRAINT chk_grade_score_consistency CHECK (
        (grade = 'S+' AND total_score >= 920) OR
        (grade = 'S'  AND total_score >= 850 AND total_score < 920) OR
        (grade = 'A'  AND total_score >= 780 AND total_score < 850) OR
        (grade = 'B'  AND total_score >= 700 AND total_score < 780) OR
        (grade = 'C'  AND total_score >= 600 AND total_score < 700) OR
        (grade = 'D'  AND total_score < 600)
    ),
    CONSTRAINT chk_invincible_consistency CHECK (
        (is_invincible = TRUE AND matches_won = total_matches AND total_matches >= 7) OR
        (is_invincible = FALSE)
    ),
    CONSTRAINT chk_match_bounds CHECK (
        matches_won <= total_matches
    ),
    CONSTRAINT chk_gauntlet_consistency CHECK (
        (matches_won = 7 AND total_matches = 7) OR
        (matches_won = total_matches - 1 AND total_matches >= 2 AND total_matches <= 7)
    )
);

-- 2. Destructive pre-constraint cleanup for existing databases (purges legacy Practice/'Standard'/0-win/invalid rows)
DELETE FROM public.universal_leaderboard
WHERE mode NOT IN ('International', 'IPL', 'Daily Stumpd')
   OR matches_won < 1
   OR total_matches > 7
   OR NOT (
       (matches_won = 7 AND total_matches = 7) OR
       (matches_won = total_matches - 1 AND total_matches >= 2 AND total_matches <= 7)
   );

-- 3. Tighten CHECK constraints on existing tables idempotently
ALTER TABLE public.universal_leaderboard
    ALTER COLUMN mode SET DEFAULT 'International',
    ALTER COLUMN matches_won SET DEFAULT 1,
    DROP CONSTRAINT IF EXISTS universal_leaderboard_mode_check,
    DROP CONSTRAINT IF EXISTS universal_leaderboard_matches_won_check,
    DROP CONSTRAINT IF EXISTS universal_leaderboard_total_matches_check,
    DROP CONSTRAINT IF EXISTS chk_mode_valid,
    DROP CONSTRAINT IF EXISTS chk_matches_won_bounds,
    DROP CONSTRAINT IF EXISTS chk_total_matches_bounds,
    DROP CONSTRAINT IF EXISTS chk_gauntlet_consistency;

ALTER TABLE public.universal_leaderboard
    ADD CONSTRAINT chk_mode_valid CHECK (mode IN ('International', 'IPL', 'Daily Stumpd')),
    ADD CONSTRAINT chk_matches_won_bounds CHECK (matches_won BETWEEN 1 AND 7),
    ADD CONSTRAINT chk_total_matches_bounds CHECK (total_matches BETWEEN 1 AND 7),
    ADD CONSTRAINT chk_gauntlet_consistency CHECK (
        (matches_won = 7 AND total_matches = 7) OR
        (matches_won = total_matches - 1 AND total_matches >= 2 AND total_matches <= 7)
    );

-- 4. Recreate high-performance index for win-first leaderboard querying
DROP INDEX IF EXISTS public.idx_universal_leaderboard_score_date;
CREATE INDEX idx_universal_leaderboard_score_date
ON public.universal_leaderboard (is_invincible DESC, matches_won DESC, total_score DESC, created_at ASC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.universal_leaderboard ENABLE ROW LEVEL SECURITY;

-- 6. Set RLS Policies & Table Privileges (read-only for anon/authenticated; writes via service_role API only)
DROP POLICY IF EXISTS "Allow public read access" ON public.universal_leaderboard;
CREATE POLICY "Allow public read access"
ON public.universal_leaderboard
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public score submission" ON public.universal_leaderboard;

REVOKE INSERT, UPDATE, DELETE ON public.universal_leaderboard FROM anon, authenticated;
GRANT SELECT ON public.universal_leaderboard TO anon, authenticated;

-- 7. Private rate-limit table for server-side score submission (service_role only)
CREATE TABLE IF NOT EXISTS public.leaderboard_rate_limits (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_created
ON public.leaderboard_rate_limits (ip_hash, created_at DESC);

ALTER TABLE public.leaderboard_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.leaderboard_rate_limits FROM anon, authenticated;
