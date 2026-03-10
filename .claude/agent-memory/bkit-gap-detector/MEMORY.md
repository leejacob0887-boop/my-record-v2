# Gap Detector Memory - my-record-v2

## Project Architecture (confirmed 2026-03-10)
- **Level**: Starter (CLAUDE.md says so, but actual implementation exceeds Starter)
- **Stack**: Next.js 15 App Router + Tailwind + TypeScript + Supabase
- **Data**: Supabase (Auth, DB, Storage) with LocalStorage cache fallback
- **Design doc (current)**: `docs/02-design/my-record-v2.design.md` (2026-03-10 updated, Supabase-based)
- **Design doc (archived)**: `docs/archive/2026-03/my-record-v2/my-record-v2.design.md` (original LocalStorage-only)

## Key Gap Findings (2026-03-10, Match Rate: 82% -> 96%)
- Design document updated to reflect Supabase implementation -- structural gaps resolved
- Remaining minor gaps (4%p, all Low impact):
  - Auth route: design says `/auth` single page, impl has `/auth/login` + `/auth/signup`
  - AuthContext returns `signOut` not documented in design
  - `AuthGate` component exists but not in design's 10-component list
  - Gap 8 persists: `diary/[id]/page.tsx` reads tags from localStorage only (functional, inconsistent)

## File Structure Notes
- Hooks: `src/lib/use{Diary,Moments,Ideas}.ts` (all have Supabase + isLoading)
- Types: `src/lib/types.ts`
- Auth: `src/context/AuthContext.tsx`
- Env vars: `.env.local` only (no `.env.example`)
