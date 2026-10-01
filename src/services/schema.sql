-- ==============================================================================
-- FILL PostgreSQL / Supabase Production Schema with Row Level Security (RLS)
-- ==============================================================================
-- Architecture Mandates:
-- 1. Every user-owned record is strictly tied to auth.uid().
-- 2. Row Level Security (RLS) enabled on all tables: users can only SELECT/INSERT/UPDATE/DELETE their own data.
-- 3. Data minimization: Sensitive fields remain encrypted / client-side; only schema metadata and
--    user-confirmed semantic associations are synchronized.
-- 4. No secret keys or service-role credentials exposed to the frontend.
-- ==============================================================================

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  preferred_mode TEXT DEFAULT 'both' CHECK (preferred_mode IN ('documents', 'websites', 'both')),
  chrome_companion_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Vault Data Table
CREATE TABLE IF NOT EXISTS public.vault_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  vault_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  completeness_percentage INTEGER DEFAULT 0,
  last_exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vault_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault data"
  ON public.vault_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault data"
  ON public.vault_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault data"
  ON public.vault_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault data"
  ON public.vault_data FOR DELETE
  USING (auth.uid() = user_id);

-- 3. FILL Memory Mappings Table (Persistent cross-form semantic associations)
CREATE TABLE IF NOT EXISTS public.memory_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_phrase TEXT NOT NULL,
  normalized_meaning TEXT NOT NULL,
  confirmed_vault_field TEXT NOT NULL,
  vault_field_title TEXT NOT NULL,
  confirmation_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, source_phrase)
);

ALTER TABLE public.memory_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory mappings"
  ON public.memory_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory mappings"
  ON public.memory_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory mappings"
  ON public.memory_mappings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory mappings"
  ON public.memory_mappings FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Form History Metadata Table
CREATE TABLE IF NOT EXISTS public.form_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  form_title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'image', 'scan', 'demo', 'website')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('needs_review', 'completed', 'in_progress')),
  completion_rate INTEGER DEFAULT 100,
  field_count INTEGER DEFAULT 0,
  matched_count INTEGER DEFAULT 0,
  fields_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.form_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own form history"
  ON public.form_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own form history"
  ON public.form_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own form history"
  ON public.form_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own form history"
  ON public.form_history FOR DELETE
  USING (auth.uid() = user_id);

-- 5. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  use_documents BOOLEAN DEFAULT TRUE,
  use_websites BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
