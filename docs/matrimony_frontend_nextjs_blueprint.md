# Matrimony Platform — Frontend Blueprint (Next.js, mock-first)

**Situation:** the Laravel backend does not exist yet. The frontend is built first, against a fake API, and switched to the real one later without rewriting components.

**The one rule that makes this work:** the app must never know whether the data is real. No component, no page, and no hook contains a `if (mock)` branch. The fake data lives behind the network boundary, and the day the backend is ready you change an environment variable.

---

## 1. Strategy

### Contract first

Before any UI, write the API contract as TypeScript types and freeze it with the backend. The types are the shared agreement; both sides build against them.

```
src/types/api.ts        ← request/response shapes
src/types/models.ts     ← Profile, Interest, Conversation, ...
src/types/enums.ts      ← InterestStatus, VerificationLevel, Visibility, ...
```

Three contract decisions to settle on day one, because they are painful to change later:

**Response envelope**

```ts
// single resource
{ data: Profile }

// collection (cursor paginated — never offset)
{ data: Profile[], meta: { next_cursor: string | null, has_more: boolean } }
```

**Error shape**

```ts
{
  message: string,
  errors?: Record<string, string[]>,  // Laravel validation style
  code?: string                       // e.g. INTEREST_QUOTA_EXCEEDED
}
```

**Auth:** bearer token in `Authorization`, refresh behaviour, and what a 401 means (log out) vs a 403 (show forbidden state). Decide now; the interceptor is written once.

### Mock at the network layer, not in the code

Use **MSW (Mock Service Worker)**. It intercepts real `fetch` calls in the browser, so your components fire genuine requests and you keep real loading states, real error paths, real latency. The alternative — a `mockApi.ts` that returns objects — lets you accidentally write code that only works with instant, always-successful data.

```
NEXT_PUBLIC_API_MODE=mock   → MSW worker starts, intercepts /api/v1/*
NEXT_PUBLIC_API_MODE=live   → requests go to the Laravel URL
```

Nothing else in the app changes between the two.

### Seed data that matches the real schema

Generate 200–500 fake profiles with `@faker-js/faker` plus hand-written Bangladeshi data: real district and upazila names, real profession and education values from the lookup tables, Bangla and English names, realistic age distribution, a mix of verification levels, some profiles with no photo, some hidden, some blocked.

Seed from a fixed random seed so the data is stable between reloads. Keep it in `src/mocks/data/` and keep it in git — it doubles as your test fixtures.

Deliberately include ugly cases, because these are what break UIs:

- A profile with an empty About and no photo
- A 40-character single-word Bangla name
- An income range of null
- A conversation with 300 messages
- A user whose daily interest quota is already spent

---

## 2. Project structure

```
src/
├── app/
│   ├── (public)/            landing, search, about, safety, faq
│   ├── (auth)/              login, register, forgot-password, verify
│   ├── (app)/               dashboard, discover, interests, shortlist,
│   │                        messages, profile, preferences, privacy,
│   │                        notifications, settings
│   └── (admin)/             users, reports, verification, photos, moderation
├── components/
│   ├── ui/                  Button, Input, Select, Modal, Toast, Skeleton
│   ├── profile/             ProfileCard, ProfileHeader, BlurredPhoto,
│   │                        MatchBreakdown, VerificationBadge
│   ├── discover/            FilterPanel, SearchBar, ProfileGrid
│   ├── interest/            InterestButton, InterestList
│   ├── chat/                ChatList, ChatWindow, MessageBubble
│   └── layout/              AppShell, BottomNav, Sidebar
├── features/                one folder per domain: hooks + queries + schemas
│   ├── auth/
│   ├── profile/
│   ├── discovery/
│   ├── interests/
│   ├── messages/
│   └── notifications/
├── lib/
│   ├── api-client.ts        fetch wrapper: base URL, auth, error normalising
│   ├── query-client.ts      TanStack Query config
│   ├── query-keys.ts        centralised key factory
│   └── i18n/
├── mocks/
│   ├── browser.ts
│   ├── server.ts            for tests
│   ├── handlers/            one file per resource
│   └── data/                seeded fixtures
└── types/
```

**Rule:** `features/*` owns data fetching. `components/*` receives props and renders. A component never calls `useQuery` directly, so components stay testable and the swap to the real API touches one layer.

---

## 3. Data layer

### The client

One `apiClient` wrapper around `fetch` that handles: base URL, auth header, JSON parsing, and converting any non-2xx into a typed `ApiError`. Every request in the app goes through it. This is the single file that changes shape if the backend surprises you.

### TanStack Query

```ts
// lib/query-keys.ts
export const keys = {
  profile:     (id: string) => ['profile', id] as const,
  discovery:   (filters: DiscoveryFilters) => ['discovery', filters] as const,
  interests:   (box: 'sent' | 'received') => ['interests', box] as const,
  conversation:(id: string) => ['conversation', id] as const,
}
```

- `useInfiniteQuery` for discovery, driven by `meta.next_cursor`.
- Optimistic updates for shortlist and send-interest, with rollback on error. Write these against the mock, with a handler that fails 20% of the time, so the rollback path is actually exercised.
- `staleTime` set per resource: profiles 5 min, notifications 30 s, conversation list 0.

### Runtime validation

Parse every mock and real response through a **Zod** schema. In mock mode it proves your fixtures match the contract; in live mode it catches the day the backend quietly renames a field. Same schema, both modes.

---

## 4. Faking auth

Mock mode needs a fake session or you cannot build anything behind the login wall.

- MSW handles `POST /auth/login` and returns a fake token for any seeded account.
- A dev-only switcher (visible only when `API_MODE=mock`) lets you jump between personas: unverified user, verified woman, guardian-managed profile, quota-exhausted user, admin. One click to re-render the whole app as someone else.
- Store the token exactly how production will store it, so the swap changes nothing.

---

## 5. Route map

```
Public
  /                       landing
  /search                 limited public search
  /profile/[publicId]     limited public profile
  /about  /safety  /faq
  /login  /register  /forgot-password  /verify

Authenticated
  /dashboard
  /discover               filters + infinite list
  /profiles/[id]          full profile
  /interests              tabs: received | sent
  /shortlist
  /messages               list
  /messages/[id]          thread
  /me                     my profile, edit sections
  /me/photos
  /me/preferences         with deal-breaker toggles
  /me/privacy             visibility + contact blocklist
  /me/managers            guardian linking
  /notifications
  /settings               language, account status, delete

Admin
  /admin/dashboard  /admin/users  /admin/reports
  /admin/verification  /admin/photos  /admin/moderation
```

Route groups carry the layout and the auth guard. Guard in middleware plus a server-side session check — never only in a `useEffect`.

---

## 6. Screen priority

Build in this order. Each screen is finished — loading, empty, error, forbidden — before the next starts.

| # | Screen | Why this order |
|---|---|---|
| 1 | Design system + AppShell | everything else sits on it |
| 2 | Register / login | defines the auth plumbing |
| 3 | Profile create (multi-step) | the hardest form in the app; do it while you're fresh |
| 4 | My profile + edit | proves the read/write round trip |
| 5 | Photos (upload, blur, primary) | file handling, needs its own mock |
| 6 | Preferences + deal-breakers | feeds discovery |
| 7 | Discover + filters | the core screen; infinite query, URL-synced filters |
| 8 | Profile detail + match breakdown | the differentiator |
| 9 | Interest flow | optimistic updates |
| 10 | Shortlist | easy, builds momentum |
| 11 | Messages | conversation list + thread |
| 12 | Dashboard | pulls everything together, build it last |
| 13 | Privacy + contact blocklist | |
| 14 | Notifications | |
| 15 | Admin screens | |

**Multi-step profile form:** keep the draft in local state plus localStorage, submit each step to its own endpoint, and never lose data on refresh. This form is where users abandon.

**Filters:** keep them in the URL (`/discover?district=dhaka&age=24-29`). Shareable, back-button correct, and it makes the saved-search feature nearly free later.

---

## 7. Required states

Every screen handles all seven, and the mock should let you trigger each one:

`Loading` · `Success` · `Empty` · `Error` · `Unauthorized` · `Forbidden` · `Not found`

Add MSW handlers for forced failure — a query param like `?__mock=error` or `?__mock=slow` — so you can demo and test each state without editing code.

Write the copy properly. An empty discover screen says what to do next ("No profiles match these filters. Try widening the age range."), not "No data found." An error says what happened and gives a retry.

---

## 8. Localization

Set this up before writing fifty components; retrofitting i18n is miserable.

- `next-intl` with `bn` and `en`, locale in the URL segment.
- Every string from a message file. No hardcoded text, including validation messages and button labels.
- Number and date formatting through the locale (Bangla numerals are a per-locale decision — pick one and be consistent).
- Profile data carries both scripts: `name_en` and `name_bn`. The UI shows the one matching the active locale and falls back.
- Test the whole app in Bangla early. Bangla text runs longer than English and breaks fixed-width buttons and card layouts.

---

## 9. Visual direction

This is a matrimony product for Bangladesh. It should feel like a careful, private registry — the restraint of an official document and the warmth of a family album — not a wedding decoration site. The two failure modes to avoid are kitsch (red, gold, floral borders, heart icons) and sterile Western dating-app minimalism.

### Tokens

```
--paper     #F2F4F1   cool paper, not cream
--ink       #1C2321   body text
--leaf      #2F5D50   primary — betel-leaf green, the brand colour
--leaf-soft #E3EBE5   tints, selected states
--marigold  #D99A2B   verification and status only, never decoration
--rose      #9C5668   interest actions (send, accepted)
--rule      #C9CEC6   hairlines, borders
```

Green carries the brand because red and gold are the kitsch defaults here and because green reads as calm and trustworthy across both major religious communities. Marigold appears only on verification badges and match scores, so a gold mark always means "this has been checked."

### Type

- **Bangla:** Tiro Bangla for headings, Hind Siliguri for UI and body. Tiro has real character at display sizes and Hind is the most legible Bangla UI face at small sizes.
- **Latin:** one companion family, sentence case throughout.
- Set a proper scale; give Bangla body text extra line-height (1.75) — the conjuncts need it.
- Line length under 70 characters on profile text.

### Principles

- **The photo is not the hero.** Discovery cards lead with the match explanation and the facts that matter — age, district, profession, education — with a blurred or small photo. This is the opposite of a dating app, and it is the correct signal for this product.
- **Verification is the loudest thing on a card.** It's the trust currency; let it earn the only bright colour.
- **One accent per screen.** If the match score is the bold element, every other element is quiet.
- **Motion only on response.** Expanding a filter panel, confirming an interest, revealing a photo. No scroll-triggered entrances.
- **Thumb-reachable.** Primary actions sit in the bottom third on mobile. Bottom nav on mobile, sidebar from `lg`.

### Components to build

`Button` `Input` `Select` `MultiSelect` `RangeSlider` `Checkbox` `Radio` `Modal` `ConfirmDialog` `Toast` `Tabs` `Badge` `Avatar` `Skeleton` `EmptyState` `ErrorState` — then the domain set: `ProfileCard` `ProfileGrid` `ProfileHeader` `ProfileSection` `BlurredPhoto` `PhotoRequestButton` `PhotoGallery` `MatchBreakdown` `VerificationBadge` `InterestButton` `ShortlistButton` `CompletionProgress` `FilterPanel` `ChatList` `ChatWindow` `MessageBubble` `NotificationItem`.

`BlurredPhoto` deserves care — it appears everywhere and it is the feature women judge the product by. Blur by default, a clear lock affordance, and a request button that explains what happens.

---

## 10. Swapping to the real API

When Laravel is ready, this is the whole checklist:

1. Set `NEXT_PUBLIC_API_MODE=live` and `NEXT_PUBLIC_API_URL`.
2. Run the app and read the console — Zod will report every field where the real response disagrees with the contract.
3. Fix the mismatches **in the types and the mocks too**, so mock mode stays truthful.
4. Replace the fake login with the real token flow and confirm 401 and 403 behave as agreed.
5. Verify cursor pagination against real data (this is where offset/cursor mistakes surface).
6. Check validation error messages — Laravel's field names must map to your form fields.
7. Run the Playwright suite, which still uses MSW, so it keeps working regardless.

Keep MSW after the swap. It stays useful for tests, for Storybook, and for working on the frontend when the backend is down.

---

## 11. Testing

- **Playwright + MSW** for the core flows: register → create profile → discover → send interest → accept → chat. These tests are the reason the mock layer exists; they run in CI with no backend.
- **Vitest + Testing Library** for the pieces with logic: filter serialisation to URL, match-breakdown rendering, interest-state button states, form validation.
- **Storybook** optional, but worth it for the state matrix — every component in loading, empty, and error.

---

## 12. Not now

Skip these until the backend is live:

Real-time chat and WebSockets · push notifications · image upload to real storage (mock the upload response) · payment and plan UI · PDF biodata rendering in the browser (server-side later) · SSR data fetching for authenticated pages (client-side with TanStack Query until the API exists) · heavy animation work.

---

## 13. Definition of done for the frontend phase

With `API_MODE=mock`, a person can click through the entire product: register, build a profile, upload photos, set preferences with deal-breakers, search and filter, open a profile and read the match breakdown, send an interest, switch persona and accept it, chat, shortlist, block, report, change privacy settings, add a contact blocklist, read notifications, switch to Bangla, and hide their profile — on a phone-sized screen, with every loading, empty, and error state visible.

If that works, the backend becomes an integration task rather than a rewrite.
