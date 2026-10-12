# Website Architecture Plan (Base MVP)

## 1) Goals & Principles
- **Research-first**: Discovery (search + library) is the primary entry point (Wiley-style inspiration).
- **Read-mostly public**: Library, papers, researchers, events visible without auth.
- **Progressive gating**: Auth only when action required (onboarding, dashboard, submissions).
- **Preserve existing work**: Keep current landing at `/legacy` while iterating on new `/`.
- **Minimal viable base**: Focus on IA/routes first, avoid over-engineering.
- **Compliance-first**: Must satisfy UTD RSO disclaimer and accessibility requirements.

## 2) User Roles
| Role | Access | Priority |
|---|---|---|
| Guest (public) | Browse library, papers, researchers, events, static/legal pages | P0 |
| Student (member) | Onboarding, dashboard/profile, projects, settings | P0 |
| Director/Faculty (admin) | Research pipeline, roster, events/content (per TRD) | P1 |

## 3) Information Architecture (Sitemap)
```
/ (Landing - Research Library)
├── /legacy                (Preserved original landing)
├── /library               (Search/browse published papers)
│   └── /library/[id]      (Paper detail + PDF/metadata)
├── /researchers           (Member roster)
│   └── /researchers/[username] (Public profile + research feed)
├── /events                (Calendar/list)
│   └── /events/[id]       (Event detail)
├── /onboarding            (Auth-gated 3-step pipeline)
├── (auth)
│   ├── /auth/login
│   ├── /auth/signup
│   └── /auth/reset-password
├── /dashboard             (Auth-gated member area)
│   ├── /dashboard/profile (edit portfolio)
│   ├── /dashboard/projects (proposals/papers)
│   └── /settings/account  (email/password)
├── Legal/Info (static)
│   ├── /about
│   ├── /accessibility
│   ├── /privacy
│   └── /rso-disclaimer
└── /api/*                 (Route handlers as needed)
```

## 4) Recommended Page Flow (Base)
**Primary discovery (guest):**
1. `/` (Hero + search + resources + subjects)
2. `/library?q=...` (search results) or `/library` (browse)
3. `/library/[id]` (paper detail) → link to `/researchers/[username]` (author)
4. `/researchers` → `/researchers/[username]`
5. `/events` → `/events/[id]`

**Conversion (join):**
1. Guest hits CTA ("Join/Get started") → `/auth/signup` (or `/onboarding` if already logged-in)
2. Post-signup → `/onboarding` (3-step per PRD/TRD)
3. On completion → `/dashboard` (or `/researchers/[username]`)

**Member workflow:**
1. Login `/auth/login` → `/dashboard` (or intended route)
2. Manage profile/projects, account → `/dashboard/profile`, `/dashboard/projects`, `/settings/account`

**Recovery:** `/auth/reset-password` (unauth) or in-app `/settings/account` (auth).

## 5) Route Structure (Next.js App Router)
| Route Group | Type | Purpose |
|---|---|---|
| `(site)` (`src/app/(site)/`) | Public | Marketing/library content (layout with site nav/footer). Root `/` lives here. |
| `(auth)` (`src/app/(auth)/`) | Public (auth forms) | Clean auth layout, no site chrome. |
| `onboarding` (`src/app/(site)/onboarding/`) | Protected | Gated 3-step flow (auth required). |
| `dashboard` (`src/app/(site)/dashboard/`) | Protected | Member workspace (role-aware later). |
| `settings` (`src/app/(site)/settings/`) | Protected | Account management. |
| `api` | Server | Auth/data endpoints if needed (Supabase SDK preferred server-side). |

> With Supabase SSR + middleware, protect `onboarding`, `dashboard`, `settings` by session/role.

## 6) Base Page Map (Purpose + Key Elements)
| Path | Page Type | Purpose | Key Elements (MVP) |
|---|---|---|---|
| `/` | Landing (public) | Search-first entry | Hero+search, Resources (History/Collected Works/Researchers), Subjects (accordion), "New to library", Footer (compliance) |
| `/legacy` | Archive (public) | Preserve original | Keep as-is, link from footer |
| `/library` | List+Search (public) | Discover papers | Search bar, filters (subject/tags/year), results grid, sort |
| `/library/[id]` | Detail (public) | Paper view | Title/authors, abstract, tags, PDF link/download, back to library |
| `/researchers` | Roster (public) | Member directory | Cards, search/filter by tags, link to profiles |
| `/researchers/[username]` | Profile (public) | Portfolio | Bio, research tags, external links (GitHub/LinkedIn), published papers feed |
| `/events` | Calendar/List (public) | Events hub | List/month toggle, event cards (time/location), CTA to register |
| `/events/[id]` | Detail (public) | Event info | Date/time/location, description, speaker, registration link |
| `/onboarding` | Flow (protected) | Member onboarding | Step 1 (app form), Step 2 (intro slides), Step 3 (branding/setup) per PRD |
| `/auth/login` | Auth (public) | Sign in | Email/password, forgot password link, signup link |
| `/auth/signup` | Auth (public) | Register | Email/password, redirect to onboarding, compliance note |
| `/auth/reset-password` | Auth (public) | Recovery | Request + update flow (per TRD) |
| `/dashboard` | Workspace (protected) | Home for members | Quick actions, pipeline status (if applicable), recent activity |
| `/dashboard/profile` | Protected | Edit portfolio | Bio, tags, links, avatar (future) |
| `/dashboard/projects` | Protected | Proposals/papers | List by status, create/view drafts (matches pipeline) |
| `/settings/account` | Protected | Credentials | Change email/password (TRD flows) |
| `/about`, `/accessibility`, `/privacy`, `/rso-disclaimer` | Static (public) | Compliance/legal | Required disclaimer + accessibility text (footer must include UTD RSO disclaimer and accessibility line per PRD §5.1) |

## 7) User Flows (Base)
| Flow | Entry | Steps | Exit |
|---|---|---|---|
| Discover paper | `/` search | Query → `/library?q=` → result → `/library/[id]` → author profile | Read/share |
| Browse by subject | `/` subjects | Expand subject → "View papers" → filtered `/library` | Discovery |
| Join AAIR | CTA `/` | `/auth/signup` → create session → `/onboarding` (3 steps) → complete → `/dashboard` | Member onboarded |
| Sign in | `/auth/login` | Auth → redirect to intended (or `/dashboard`) | Member workspace |
| Reset password | Login link | `/auth/reset-password` (request) → email flow → update → `/auth/login` | Recovered |
| Update profile | `/dashboard` | Profile → edit → save → public view `/researchers/[username]` | Portfolio updated |
| Account security | `/settings/account` | Change email/password → confirm → success | Credentials updated |

## 8) MVP Scope (Base Build Only)
**Include (P0):**
- New landing `/` + legacy `/legacy`
- Public core: `/library`, `/library/[id]`, `/researchers`, `/researchers/[username]`, `/events`, `/events/[id]`
- Auth + onboarding shell: `/auth/*`, `/onboarding` (route + scaffold)
- Member base: `/dashboard`, `/dashboard/profile`, `/dashboard/projects`, `/settings/account`
- Static/legal + footer compliance (UTD RSO disclaimer, accessibility)

**Defer (P1/P2):**
- Full onboarding step logic/UI polish
- Kanban/admin pipeline UI (schema exists in TRD)
- File uploads (PDF) beyond scaffold
- Advanced search filters/sorting logic
- Rich content management

## 9) Open Questions (to confirm)
1. **Search scope**: Library-only initially (`q` → `/library`) or global (papers+researchers+events)?
2. **Onboarding gating**: Should `/dashboard` redirect users with `onboarding_completed=false` to `/onboarding`?
3. **Profile slugs**: Use `username` (from profile) vs ID for `/researchers/[username]` (add unique username if desired)?
4. **Subjects**: Keep hardcoded for MVP or drive from tags in DB?
5. **Hero background**: Use existing `/logo.png` or AAIR Assets for a proper library photo?

## 10) Suggested Next Steps
1. Create empty route stubs for MVP paths (scaffold pages with minimal TSX + metadata).
2. Add middleware for protected routes (`onboarding`, `dashboard`, `settings`).
3. Wire search form on `/` to `/library?q=...` (already done in new landing).
4. Add compliance blocks to footer (UTD RSO + accessibility) if not fully present.
5. Keep changes additive; don’t remove legacy.
