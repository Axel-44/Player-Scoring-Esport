-- ==============================================================================
-- PULSE SCOUT - Skema Database & Row Level Security (Supabase PostgreSQL)
-- Skripsi: Talent Scouting Player Scoring Berbasis XGBoost (PUBG Mobile)
-- Penulis: Axel Juanito Parlindungan Sibarani (NPM: 065122199)
-- ==============================================================================

-- 1. Enable Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABEL PROFILES (Biodata & Identitas Atlet / Manajer)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('manager', 'player')),
    avatar_url TEXT,
    ign TEXT,
    game_id TEXT,
    role_preference TEXT DEFAULT 'Rusher / Fragger',
    bio TEXT,
    recruitment_status TEXT DEFAULT 'Open to Trial / Free Agent',
    team_name TEXT DEFAULT 'Free Agent',
    age INT CHECK (age IS NULL OR (age >= 12 AND age <= 60)),
    origin_city TEXT,
    device TEXT,
    instagram TEXT,
    discord TEXT,
    whatsapp TEXT,
    is_profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrasi kolom jika tabel profiles sudah pernah dibuat sebelumnya
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ign TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS game_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_preference TEXT DEFAULT 'Rusher / Fragger';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruitment_status TEXT DEFAULT 'Open to Trial / Free Agent';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_name TEXT DEFAULT 'Free Agent';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS origin_city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Trigger Otomatis: Menyalin metadata saat user baru mendaftar di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, ign, is_profile_completed)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. TABEL TEAMS (Profil Tim E-Sports & Lowongan Roster Buatan Manajer)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    division TEXT DEFAULT 'PUBG Mobile Competitive',
    city TEXT,
    established TEXT DEFAULT '2026',
    logo_url TEXT,
    active_roster_count INT DEFAULT 0 CHECK (active_roster_count >= 0),
    max_roster_count INT DEFAULT 5 CHECK (max_roster_count >= 1),
    vision TEXT,
    mission TEXT,
    open_recruitment BOOLEAN DEFAULT true,
    recruitment_role TEXT DEFAULT 'All Roles',
    needed_roles TEXT[] DEFAULT '{}',
    recruitment_min_score NUMERIC(5, 2) DEFAULT 75.0 CHECK (recruitment_min_score >= 0 AND recruitment_min_score <= 100),
    trial_notes TEXT,
    contact_manager TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    instagram TEXT,
    is_profile_completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON public.teams (manager_id);
CREATE INDEX IF NOT EXISTS idx_teams_open_recruitment ON public.teams (open_recruitment);
CREATE INDEX IF NOT EXISTS idx_teams_min_score ON public.teams (recruitment_min_score);

-- ==============================================================================
-- 4. TABEL PLAYERS (Statistik Pertandingan & Prediksi Skor XGBoost)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL jika data benchmark publik Kaggle
    ign TEXT NOT NULL,
    role TEXT DEFAULT 'Rusher / Fragger',
    tier TEXT NOT NULL CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror')),
    map TEXT DEFAULT 'Erangel',
    favorite_weapon TEXT DEFAULT 'M416',
    kills INT NOT NULL CHECK (kills >= 0),
    damage_dealt NUMERIC(7, 2) NOT NULL CHECK (damage_dealt >= 0),
    survival_time_minutes NUMERIC(5, 2) NOT NULL CHECK (survival_time_minutes >= 0),
    headshot_percentage NUMERIC(5, 2) NOT NULL CHECK (headshot_percentage >= 0 AND headshot_percentage <= 100),
    assists INT NOT NULL CHECK (assists >= 0),
    revives INT NOT NULL CHECK (revives >= 0),
    distance_travelled_km NUMERIC(6, 2) DEFAULT 0 CHECK (distance_travelled_km >= 0),
    longest_kill_meters NUMERIC(6, 2) DEFAULT 0 CHECK (longest_kill_meters >= 0),
    heals_used INT DEFAULT 0 CHECK (heals_used >= 0),
    boosts_used INT DEFAULT 0 CHECK (boosts_used >= 0),
    match_rank INT NOT NULL CHECK (match_rank >= 1 AND match_rank <= 100),
    player_score NUMERIC(5, 2) NOT NULL CHECK (player_score >= 0 AND player_score <= 100),
    score_category TEXT NOT NULL CHECK (score_category IN ('Rendah', 'Menengah', 'Tinggi', 'Berpotensi', 'Master', 'Elite')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index performa pencarian dan pengurutan Leaderboard
CREATE INDEX IF NOT EXISTS idx_players_score ON public.players (player_score DESC);
CREATE INDEX IF NOT EXISTS idx_players_tier ON public.players (tier);
CREATE INDEX IF NOT EXISTS idx_players_ign ON public.players (ign);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players (user_id);

-- ==============================================================================
-- 5. TABEL SHORTLISTS (Daftar Pantauan Kandidat oleh Manager)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Prioritas Rekrutmen',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shortlists_manager_id ON public.shortlists (manager_id);

-- ==============================================================================
-- 6. TABEL SHORTLIST_ITEMS (Item Pemain yang Dipantau beserta Catatan Scout)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shortlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shortlist_id UUID NOT NULL REFERENCES public.shortlists(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(shortlist_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlist_items_shortlist ON public.shortlist_items (shortlist_id);
CREATE INDEX IF NOT EXISTS idx_shortlist_items_player ON public.shortlist_items (player_id);

-- ==============================================================================
-- 7. TABEL TEAM_WISHLISTS (Tim Impian yang Disimpan oleh Atlet)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(player_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_team_wishlists_player ON public.team_wishlists (player_id);
CREATE INDEX IF NOT EXISTS idx_team_wishlists_team ON public.team_wishlists (team_id);

-- ==============================================================================
-- 8. TABEL NOTIFICATIONS (Sistem Notifikasi Rekrutmen & Scouting)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    team_name TEXT,
    team_tag TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    action_label TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (read);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di seluruh tabel publik
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. Kebijakan Keamanan: Profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles dapat dibaca oleh seluruh user terautentikasi" ON public.profiles;
CREATE POLICY "Profiles dapat dibaca oleh seluruh user terautentikasi"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "User hanya dapat mengupdate profil miliknya sendiri" ON public.profiles;
CREATE POLICY "User hanya dapat mengupdate profil miliknya sendiri"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- B. Kebijakan Keamanan: Teams (Direktori Publik & Manajemen Tim)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Semua pengguna dapat melihat tim publik" ON public.teams;
CREATE POLICY "Semua pengguna dapat melihat tim publik"
    ON public.teams FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Manager dapat membuat profil tim miliknya" ON public.teams;
CREATE POLICY "Manager dapat membuat profil tim miliknya"
    ON public.teams FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Manager hanya dapat mengupdate tim miliknya" ON public.teams;
CREATE POLICY "Manager hanya dapat mengupdate tim miliknya"
    ON public.teams FOR UPDATE
    TO authenticated
    USING (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Manager hanya dapat menghapus tim miliknya" ON public.teams;
CREATE POLICY "Manager hanya dapat menghapus tim miliknya"
    ON public.teams FOR DELETE
    TO authenticated
    USING (auth.uid() = manager_id);

-- ------------------------------------------------------------------------------
-- C. Kebijakan Keamanan: Players (Statistik & Leaderboard)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Semua pengguna dapat melihat leaderboard pemain" ON public.players;
CREATE POLICY "Semua pengguna dapat melihat leaderboard pemain"
    ON public.players FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Pemain dapat menginput statistik pertandingannya" ON public.players;
CREATE POLICY "Pemain dapat menginput statistik pertandingannya"
    ON public.players FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Pemain hanya dapat mengubah data miliknya" ON public.players;
CREATE POLICY "Pemain hanya dapat mengubah data miliknya"
    ON public.players FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pemain dapat menghapus statistik miliknya" ON public.players;
CREATE POLICY "Pemain dapat menghapus statistik miliknya"
    ON public.players FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- D. Kebijakan Keamanan: Shortlists & Shortlist Items (Khusus Manager)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Manager hanya dapat melihat shortlist miliknya" ON public.shortlists;
CREATE POLICY "Manager hanya dapat melihat shortlist miliknya"
    ON public.shortlists FOR SELECT
    TO authenticated
    USING (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Manager dapat membuat shortlist miliknya" ON public.shortlists;
CREATE POLICY "Manager dapat membuat shortlist miliknya"
    ON public.shortlists FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Manager dapat menghapus shortlist miliknya" ON public.shortlists;
CREATE POLICY "Manager dapat menghapus shortlist miliknya"
    ON public.shortlists FOR DELETE
    TO authenticated
    USING (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Manager dapat melihat item dalam shortlist miliknya" ON public.shortlist_items;
CREATE POLICY "Manager dapat melihat item dalam shortlist miliknya"
    ON public.shortlist_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.shortlists s
            WHERE s.id = shortlist_items.shortlist_id AND s.manager_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Manager dapat menambah item ke shortlist miliknya" ON public.shortlist_items;
CREATE POLICY "Manager dapat menambah item ke shortlist miliknya"
    ON public.shortlist_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shortlists s
            WHERE s.id = shortlist_items.shortlist_id AND s.manager_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Manager dapat memperbarui catatan item dalam shortlist" ON public.shortlist_items;
CREATE POLICY "Manager dapat memperbarui catatan item dalam shortlist"
    ON public.shortlist_items FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.shortlists s
            WHERE s.id = shortlist_items.shortlist_id AND s.manager_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Manager dapat menghapus item dari shortlist miliknya" ON public.shortlist_items;
CREATE POLICY "Manager dapat menghapus item dari shortlist miliknya"
    ON public.shortlist_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.shortlists s
            WHERE s.id = shortlist_items.shortlist_id AND s.manager_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- E. Kebijakan Keamanan: Team Wishlists (Khusus Atlet)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Pemain dapat melihat wishlist tim impian miliknya" ON public.team_wishlists;
CREATE POLICY "Pemain dapat melihat wishlist tim impian miliknya"
    ON public.team_wishlists FOR SELECT
    TO authenticated
    USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Pemain dapat menambahkan tim ke wishlist" ON public.team_wishlists;
CREATE POLICY "Pemain dapat menambahkan tim ke wishlist"
    ON public.team_wishlists FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Pemain dapat menghapus tim dari wishlist miliknya" ON public.team_wishlists;
CREATE POLICY "Pemain dapat menghapus tim dari wishlist miliknya"
    ON public.team_wishlists FOR DELETE
    TO authenticated
    USING (auth.uid() = player_id);

-- ------------------------------------------------------------------------------
-- F. Kebijakan Keamanan: Notifications
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "User hanya dapat melihat notifikasi yang ditujukan kepadanya" ON public.notifications;
CREATE POLICY "User hanya dapat melihat notifikasi yang ditujukan kepadanya"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "User dapat memperbarui status baca notifikasinya" ON public.notifications;
CREATE POLICY "User dapat memperbarui status baca notifikasinya"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = recipient_id);
