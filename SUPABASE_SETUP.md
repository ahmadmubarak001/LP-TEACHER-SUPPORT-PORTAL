# Supabase Integration & Production Deployment Guide
## Kerala LP Teacher Support Portal (കേരള എൽ.പി അധ്യാപക സഹായി)

This document provides complete instructions for configuring Supabase, applying database migrations, securing the storage bucket, deploying Edge Functions, provisioning administrators safely, and validating all Row-Level Security (RLS) policies.

---

### Table of Contents
1. [Environment Variables Configuration](#1-environment-variables-configuration)
2. [Database Schema & Migrations](#2-database-schema--migrations)
3. [Row Level Security (RLS) Policies Breakdown](#3-row-level-security-rls-policies-breakdown)
4. [Storage Configuration (Private Bucket)](#4-storage-configuration-private-bucket)
5. [Supabase Edge Functions Deployment](#5-supabase-edge-functions-deployment)
6. [Administrator Provisioning Process](#6-administrator-provisioning-process)
7. [Testing & RLS Policy Validation](#7-testing--rls-policy-validation)

---

### 1. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following variables:

```ini
# Client-safe keys (Exposed to Vite frontend)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Server-side ONLY keys (NEVER bundled into client code!)
# Used by Express server & Edge Functions for private signed URLs and admin operations
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Rate Limiting & Origin
CORS_ORIGIN="https://your-applet-url.run.app"
APP_URL="https://your-applet-url.run.app"
```

> **Security Rule**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is strictly retained in `server.ts` or Edge Functions and is never exposed in client bundles.

---

### 2. Database Schema & Migrations

The migration file is located at:
`supabase/migrations/20261026000000_lp_teacher_support_schema.sql`

To apply via the Supabase CLI:
```bash
supabase db push
# or
supabase migration up
```

Alternatively, copy the SQL file contents directly into the **Supabase Dashboard → SQL Editor** and execute it.

#### Database Tables Created:
- **`public.profiles`**: User profiles with `role` (`'admin'` or `'teacher'`).
- **`public.resources`**: Educational resources (Classes 1–4, Malayalam, English, Mathematics, EVS, etc.) with `status` (`'draft'`, `'published'`, or `'archived'`).
- **`public.teacher_requests`**: Private requests submitted by teachers, identified by a unique `ref_number` (e.g. `LPR-2026-X9K2M`).
- **`public.audit_logs`**: Immutable audit logs capturing administrative operations and download token issuances.

---

### 3. Row Level Security (RLS) Policies Breakdown

Every table has RLS explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

#### `public.resources`
- **Public / Anonymous SELECT**:
  ```sql
  CREATE POLICY "Public can view published resources only"
    ON public.resources FOR SELECT
    USING (status = 'published');
  ```
  *Guarantee*: Drafts and archived resources are mathematically omitted from anonymous queries.
- **Admin Full Access**:
  ```sql
  CREATE POLICY "Admins have full access to resources"
    ON public.resources FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  ```

#### `public.teacher_requests` (Strict Privacy)
- **Public INSERT**:
  ```sql
  CREATE POLICY "Public can insert pending teacher requests"
    ON public.teacher_requests FOR INSERT
    WITH CHECK (
      status = 'pending' AND 
      (admin_notes IS NULL OR admin_notes = '')
    );
  ```
- **Admin SELECT / UPDATE / DELETE**:
  ```sql
  CREATE POLICY "Admins can view all teacher requests"
    ON public.teacher_requests FOR SELECT
    USING (public.is_admin());
  ```
  *Guarantee*: Anonymous users cannot list or browse teacher requests. Teacher contact details and school names remain strictly confidential.

---

### 4. Storage Configuration (Private Bucket)

The `educational-resources` bucket is created with `public = false`.

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('educational-resources', 'educational-resources', false, 52428800)
ON CONFLICT (id) DO UPDATE SET public = false;
```

#### Why Direct Public Download is Blocked:
Because the bucket is private, direct public URL queries (`https://[id].supabase.co/storage/v1/object/public/...`) return HTTP 403 Forbidden.

Downloads are mediated exclusively by the verified Edge Function `/download-resource`, which:
1. Validates that the requested resource record has `status = 'published'`.
2. Rejects draft or archived files with HTTP 403.
3. Issues a cryptographic signed URL valid for **60 seconds**.

---

### 5. Supabase Edge Functions Deployment

The project provides standard Deno Edge Functions in `supabase/functions/`:

1. **`download-resource`**:
   Verifies published state and returns short-lived signed URL.
   ```bash
   supabase functions deploy download-resource
   ```

2. **`submit-teacher-request`**:
   Validates inputs, executes rate limiting, and returns a verified reference number.
   ```bash
   supabase functions deploy submit-teacher-request
   ```

Both functions are also mirrored by the backend Express server (`server.ts`) for continuous local execution and zero-downtime container hosting.

---

### 6. Administrator Provisioning Process

#### Disabling Public Admin Registration:
Public sign-up is prevented from elevating to admin role by the database trigger:
```sql
CREATE OR REPLACE FUNCTION public.prevent_public_admin_elevation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'admin' AND (OLD IS NULL OR OLD.role <> 'admin') THEN
    IF current_user <> 'service_role' AND current_user <> 'postgres' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Administrator accounts can only be provisioned by backend administrators.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
```

#### Step-by-Step Admin Provisioning:
1. Navigate to **Supabase Dashboard → Authentication → Users**.
2. Click **"Invite User"** or **"Add User"** and specify the officer's email (e.g. `admin.scert@kerala.gov.in`).
3. Open **SQL Editor** and run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin',
       full_name = 'SCERT LP Curriculum Coordinator'
   WHERE email = 'admin.scert@kerala.gov.in';
   ```
4. Verify by checking:
   ```sql
   SELECT id, email, role FROM public.profiles WHERE role = 'admin';
   ```

---

### 7. Testing & RLS Policy Validation

Run the automated test suite locally:
```bash
npm test
# runs: npx --yes tsx --test src/**/*.test.ts
```

In the app UI:
1. Log in via **Admin Login → Quick Demo** or use admin credentials.
2. Go to the **Supabase & RLS Health** tab.
3. Click **"Run RLS Policy Test Suite"** to verify:
   - Anonymous session SELECT filtering (no draft leaks)
   - Draft download prohibition (HTTP 403)
   - Published download clearance (HTTP 200 + 60s TTL)
   - Teacher requests table isolation
   - Admin elevation guard trigger
