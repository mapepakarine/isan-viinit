# Isän viinit — wine journal PWA

A personal wine journal app, built as a Father's Day gift for one user (my dad) on his phone.
Read `docs/PROJECT_PLAN.md` for milestones and acceptance criteria before starting any work.

## Hard constraints (never break these)
- **€0 running cost.** No backend, no database server, no accounts, no paid APIs.
- **Offline-first.** After the first visit the app must fully work in airplane mode.
- **All data stays on the phone** in IndexedDB (via Dexie). Never use localStorage for wine data.
- **No runtime network calls** except loading/updating the app itself from GitHub Pages.
- **UI language: Finnish.** All user-facing strings live in `src/i18n/fi.ts`. Code, comments and docs in English.
- **Mobile-first and dad-friendly:** designed for 360–430 px wide screens, tap targets ≥ 44 px, base font ≥ 17 px, high contrast, no hidden gestures.

## Stack
- React 18 + Vite + TypeScript (strict)
- `vite-plugin-pwa` (manifest + service worker, `registerType: 'prompt'` with an in-app "Päivitä" banner)
- Dexie + `dexie-react-hooks` (`useLiveQuery`) for storage
- Tailwind CSS for styling
- React Router with **HashRouter** (GitHub Pages has no SPA fallback)
- `browser-image-compression` for photos
- `jszip` for backup export/import
- Vitest for unit tests
- Tesseract.js (milestone M5 only, lazy-loaded, `fin+eng` traineddata cached for offline use)

## Project structure
```
src/
  main.tsx, App.tsx
  routes/            Home.tsx, AddEditWine.tsx, WineCard.tsx, Stats.tsx, Settings.tsx
  components/        WineListItem, StarRating, FilterChips, PhotoPicker, SummaryCard, UpdateBanner
  db/                db.ts (Dexie schema + migrations), types.ts
  lib/               summaries.ts, stats.ts, knowledge.ts, image.ts, backup.ts (pure, unit-tested)
  i18n/fi.ts         all Finnish UI strings
public/
  knowledge.json     grape + region knowledge base (cached by the service worker)
  icons/             PWA icons incl. apple-touch-icon (180x180)
docs/PROJECT_PLAN.md
```

## Data model
```ts
type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'other';

interface Wine {
  id?: number;
  name: string;            // required
  producer?: string;
  type: WineType;
  grape?: string;          // matches a key in knowledge.json when possible
  country?: string;
  region?: string;
  vintage?: number;
  price?: number;          // EUR
  store?: string;          // e.g. "Alko"
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  food?: string;
  buyAgain: boolean;
  photo?: Blob;            // max 1200 px long edge, JPEG q≈0.75
  thumb?: Blob;            // 300 px, used in lists
  tastedAt: string;        // ISO date (YYYY-MM-DD)
  createdAt: string;       // ISO datetime
  updatedAt: string;
}
// Dexie: wines: '++id, name, type, grape, country, rating, buyAgain, tastedAt'
```
Schema changes must add a new `db.version(n)` with an upgrade function — never edit an existing version.

## Conventions
- Business logic (summaries, stats, knowledge lookup, backup) goes in `src/lib/` as pure functions with Vitest tests.
- Components stay thin; read data with `useLiveQuery`.
- Revoke object URLs created for photo Blobs when components unmount.
- Call `navigator.storage.persist()` on first launch and show its result in Settings.
- Keep bundle small: lazy-load Stats and Tesseract.
- Vite `base` must be `'/<repo-name>/'` for GitHub Pages; manifest `start_url` and `scope` must match.

## Commands
- `npm run dev` — local dev server (use `--host` to test on a phone on the same Wi-Fi)
- `npm run build` / `npm run preview`
- `npm test` — Vitest
- Deploy: GitHub Actions workflow builds and publishes `dist/` to GitHub Pages on push to `main`.

## Definition of done (every milestone)
1. `npm run build` and `npm test` pass with no TypeScript errors.
2. Feature works in Chrome devtools mobile emulation **and** with network set to Offline.
3. No hard-coded Finnish strings outside `src/i18n/fi.ts`.
4. Summarize what changed and what to test manually, then stop and wait for review.

## Don'ts
- Don't add any backend, analytics, tracking, external fonts or CDN scripts.
- Don't add dependencies beyond the stack above without asking.
- Don't store photos as base64 strings — store Blobs.
