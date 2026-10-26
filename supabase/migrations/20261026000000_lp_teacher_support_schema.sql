-- ==============================================================================
-- LP Teacher Support Portal (കേരള എൽ.പി അധ്യാപക സഹായി)
-- Production Supabase Database Schema & Row-Level Security (RLS) Migrations
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  school_name TEXT DEFAULT '',
  district TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by email and role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 3. Resources Table (Lower Primary Teaching Resources: Classes 1 to 4)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ml TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ml TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  class_level INT NOT NULL CHECK (class_level BETWEEN 1 AND 4),
  subject TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('lesson_plan', 'worksheet', 'question_paper', 'teaching_aid', 'audio_visual', 'handbook', 'activity_card')),
  file_path TEXT NOT NULL,
  file_size TEXT NOT NULL DEFAULT '1.0 MB',
  file_format TEXT NOT NULL DEFAULT 'PDF',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  downloads_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_class_level ON public.resources(class_level);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources(subject);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON public.resources(resource_type);

-- ------------------------------------------------------------------------------
-- 4. Teacher Requests Table (Private Submissions from LP Teachers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_number TEXT UNIQUE NOT NULL,
  teacher_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  district TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  class_level INT NOT NULL CHECK (class_level BETWEEN 1 AND 4),
  subject TEXT NOT NULL,
  request_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'fulfilled', 'rejected')),
  admin_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_requests_status ON public.teacher_requests(status);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_ref ON public.teacher_requests(ref_number);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_district ON public.teacher_requests(district);

-- ------------------------------------------------------------------------------
-- 5. Audit Logs Table (Privileged Operations Logging)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('resource', 'teacher_request', 'system', 'auth')),
  entity_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. Helper Security Functions (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Fast check if caller is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Prevent unauthorized users from elevating themselves to admin via client metadata
CREATE OR REPLACE FUNCTION public.prevent_public_admin_elevation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If new role is admin, ensure it is executed by a superuser/service_role or existing verified admin
  IF NEW.role = 'admin' AND (OLD IS NULL OR OLD.role <> 'admin') THEN
    IF current_user <> 'service_role' AND current_user <> 'postgres' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Administrator accounts can only be provisioned through secure backend scripts or database administrators.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_admin_elevation ON public.profiles;
CREATE TRIGGER trg_prevent_admin_elevation
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_public_admin_elevation();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resources_updated_at ON public.resources;
CREATE TRIGGER trg_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_requests_updated_at ON public.teacher_requests;
CREATE TRIGGER trg_requests_updated_at
BEFORE UPDATE ON public.teacher_requests
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- 7. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 7.1 PROFILES POLICIES
-- Users can view their own profile; admins can view all profiles
CREATE POLICY "Users can read own profile or admin can read all"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update non-role fields of their own profile; admin elevation is blocked by trigger
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 7.2 RESOURCES POLICIES
-- Public & Anonymous users can ONLY view published resources
CREATE POLICY "Public can view published resources only"
  ON public.resources
  FOR SELECT
  USING (status = 'published');

-- Admins have full access to view, insert, update, archive, and delete resources
CREATE POLICY "Admins have full access to resources"
  ON public.resources
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.3 TEACHER REQUESTS POLICIES (Strict Privacy)
-- Public users can insert teacher requests, but cannot set status != 'pending' or fill admin_notes
CREATE POLICY "Public can insert pending teacher requests"
  ON public.teacher_requests
  FOR INSERT
  WITH CHECK (
    status = 'pending' AND 
    (admin_notes IS NULL OR admin_notes = '')
  );

-- Only verified administrators can view teacher requests (protecting teacher privacy)
CREATE POLICY "Admins can view all teacher requests"
  ON public.teacher_requests
  FOR SELECT
  USING (public.is_admin());

-- Only verified administrators can update status or private notes
CREATE POLICY "Admins can update teacher requests"
  ON public.teacher_requests
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only verified administrators can delete requests
CREATE POLICY "Admins can delete teacher requests"
  ON public.teacher_requests
  FOR DELETE
  USING (public.is_admin());

-- 7.4 AUDIT LOGS POLICIES
-- Only administrators can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_admin());

-- Only administrators or service_role can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. Storage Configuration (Private Educational Resources Bucket)
-- ------------------------------------------------------------------------------
-- Ensure bucket exists and is PRIVATE (public = false)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'educational-resources',
  'educational-resources',
  false,
  52428800, -- 50 MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'video/mp4', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800;

-- Storage RLS: Public direct SELECT is denied.
-- Only authenticated admins can upload/delete objects in storage.
CREATE POLICY "Admins can manage educational resource files"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'educational-resources' AND public.is_admin())
  WITH CHECK (bucket_id = 'educational-resources' AND public.is_admin());

-- Public downloads must use short-lived signed URLs generated by the Edge Function
-- after verifying that the resource record is published.
