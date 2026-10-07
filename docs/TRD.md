# Technical Requirement Document (TRD)

**Product Name:** AAIR Labs Centralized Web Portal

**Organization:** Applied AI Research Labs at UTD (AAIR Labs)

**Stack:** Next.js (App Router), TypeScript, Shadcn UI, Vercel, Supabase (Auth, Postgres, Storage)

**Document Version:** 1.2

---

## 1. System Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────────┐
                     │            Vercel Deployment                 │
                     │  Next.js App Router (TypeScript + Shadcn UI) │
                     └──────────────────────┬───────────────────────┘
                                            │
                             ┌──────────────┴──────────────┐
                             ▼                             ▼
                  ┌────────────────────┐        ┌────────────────────┐
                  │ Supabase Auth &    │        │ Supabase Storage   │
                  │ Database (Postgres)│        │ (`research-papers`)│
                  └────────────────────┘        └────────────────────┘
```

* **Hosting & Deployment:** Vercel (CI/CD integration via GitHub).
* **Frontend Framework:** Next.js (App Router) + TypeScript + Tailwind CSS + Shadcn UI + Lucide Icons.
* **Backend & Authentication:** Supabase Auth (Email + Password provider, **Email Verification Disabled**) & Supabase Server Client / Middleware.
* **Database:** Supabase Managed PostgreSQL.
* **File Storage:** Supabase Storage Bucket (`research-papers`) capped at 20 MB per PDF file.

---

## 2. Authentication & Account Management Flow

### 2.1 Direct Auth Strategy (No Verification)

* Sign-up requests return an authenticated session immediately without requiring email confirmation links.
* Upon successful registration, users are redirected directly into **Step 1** of the Onboarding Pipeline.

### 2.2 Account Recovery & Credentials Management Workflows

1. **Password Reset (Forgot Password - Unauthenticated):**
   * `POST /api/auth/reset-password-request` triggers `supabase.auth.resetPasswordForEmail()`.
   * Redirects to password update page (`/auth/reset-password`) where the user provides a new password.

2. **In-App Password Change (Authenticated):**
   * User navigates to `/settings/account` in dashboard.
   * Inputs current password and new password; updates via `supabase.auth.updateUser({ password: newPassword })`.

3. **In-App Email Modification (Authenticated):**
   * User inputs new email on `/settings/account`.
   * Updates `auth.users` via `supabase.auth.updateUser({ email: newEmail })` and syncs the updated email to `public.profiles.email`.

---

## 3. Database Schema (PostgreSQL)

### 3.1 Enums & Custom Types

```sql
CREATE TYPE user_role AS ENUM ('guest', 'student', 'director', 'faculty');
CREATE TYPE proposal_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');
CREATE TYPE paper_status AS ENUM ('draft', 'under_review', 'revision_required', 'published');
```

### 3.2 Tables

#### `profiles`

Extends `auth.users` to maintain student portfolio & qualifying details.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'student'::user_role,
  major TEXT DEFAULT '',
  expected_grad_date TEXT DEFAULT '',
  fields_of_interest TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  research_tags TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `projects`

Represents student project entries and paper proposal containers.

```sql
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  status proposal_status DEFAULT 'pending'::proposal_status,
  director_feedback TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `paper_drafts`

Tracks manuscript versions and PDF/LaTeX assets through the approval pipeline.

```sql
CREATE TABLE public.paper_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  pdf_storage_path TEXT NOT NULL,
  latex_url TEXT DEFAULT '',
  status paper_status DEFAULT 'draft'::paper_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `peer_reviews`

Tracks peer reviewer assignments and feedback notes.

```sql
CREATE TABLE public.peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_draft_id UUID NOT NULL REFERENCES public.paper_drafts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback_notes TEXT DEFAULT '',
  recommended_status paper_status,
  is_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `events`

Stores public event calendar items.

```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'workshop', -- 'workshop', 'soc_meeting', 'headshot_session', 'speaker'
  registration_link TEXT DEFAULT '',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Row Level Security (RLS) & Access Control

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles Policy
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects Policy
CREATE POLICY "Anyone can view approved projects" ON public.projects FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors can view own projects" ON public.projects FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can create proposals" ON public.projects FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Storage Policies (`research-papers`)
CREATE POLICY "Public Read Papers" ON storage.objects FOR SELECT USING (bucket_id = 'research-papers');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'research-papers' AND auth.role() = 'authenticated'
);
```

---

## 5. API & Route Handler Structure

### 5.1 Auth & Account Management

* `POST /api/auth/signup` – Instant account creation with no email verification requirement.
* `POST /api/auth/login` – Direct email/password authentication.
* `POST /api/auth/reset-password` – Triggers password reset email workflow.
* `PATCH /api/account/update-credentials` – Allows authenticated user to update email or change password in settings.

### 5.2 Onboarding & Portfolio API

* `POST /api/onboarding/complete` – Updates member background details and flags onboarding as finished.
* `PATCH /api/portfolio/update` – Edits custom bio, social links (GitHub/LinkedIn), and research tags.

### 5.3 Research Pipeline API

* `POST /api/proposals` – Submits paper proposals.
* `PATCH /api/proposals/[id]/review` – Directors approve or request revisions on proposals.
* `POST /api/papers/upload` – Uploads PDF draft to Supabase Storage.
* `PATCH /api/papers/[id]/publish` – Directors convert paper to published status in the public library.

---

## 6. Environment Variables (Vercel Config)

```env
# Client Side Variables
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server Side / Admin Variables
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
