# Shondhan Matrimony — Frontend

A careful, private matrimony registry for Bangladesh. Next.js 16 (App Router) +
React 19, TanStack Query, Zod, and a hand-built design system. Bilingual
(বাংলা / English) throughout.

This app is **wired to the live Laravel backend** — the MSW mock layer has been
removed. Every screen fires real requests through a single `apiClient`.

## Prerequisites

- The Laravel backend running (default `http://localhost:8000`). It lives in the
  sibling `../backend` directory. Make sure it is migrated and seeded
  (`php artisan migrate --seed`) so the lookup tables (districts, religions,
  professions, education levels) are populated.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME="Shondhan Matrimony"
NEXT_PUBLIC_DEFAULT_LOCALE=bn
```

Point `NEXT_PUBLIC_API_URL` at your backend. Auth is a bearer token stored in
`localStorage` and attached by `src/lib/api-client.ts`; a `401` clears the
session and redirects to `/login`.

## Architecture

```
src/
├── app/                 routes — (app) group is the authenticated, guarded area
├── components/
│   ├── ui/              design system: Button, form controls, Modal, Badge, …
│   ├── layout/          AppShell, nav, PageHeader, AuthCard
│   ├── profile/         ProfileCard, MatchBreakdown, PhotoGallery, actions
│   └── providers/       Query, Auth, Toast, i18n
├── features/<domain>/   data layer — one folder per domain: hooks + schemas
│                        (auth, profile, preferences, photos, discovery,
│                         interests, shortlist, messages, notifications,
│                         safety, lookups)
├── lib/                 api-client, query config/keys, i18n, formatters
└── types/               the API contract (models, api, enums) — mirrors the
                         Laravel resources exactly
```

**Rule:** `features/*` owns data fetching (TanStack Query). `components/*`
receive props and render. The whole app talks to the backend through
`lib/api-client.ts` — the one file to change if the contract shifts.

Admin screens are intentionally absent: the backend exposes no admin API routes.
