# Project plan — Isän viinit (wine journal)

## Goal
A free, offline phone app where dad logs the wines he drinks — photo, rating, notes, food — and gets
readable summaries, wine knowledge and stats about his own taste. Given as a Father's Day gift, then
improved with "gift updates" over time.

## Success criteria
- Dad can add a wine in under 60 seconds without help.
- The app opens and works fully in airplane mode.
- No running costs, no accounts, no ads.
- His data survives app updates and can be backed up and restored on a new phone.

## Scope
**v1 (gift version):** add/edit/delete wines with photo, list + search + filters, wine card with
auto-summary and grape/region knowledge, journal summary, stats, backup export/import, PWA install.

**Later gift updates:** label reading (OCR), "what to open tonight?" picker, optional online sync,
optional AI summaries.

**Out of scope:** multi-user, cloud backend, social sharing, price scraping.

---

## Milestones

### M0 — Setup & deploy (≈30 min)
- Vite + React + TS + Tailwind, HashRouter, `vite-plugin-pwa` with manifest (name "Isän viinit",
  `display: standalone`, theme color wine red, icons incl. apple-touch-icon).
- GitHub repo + Actions workflow deploying to GitHub Pages; correct `base` path.
- Empty routed screens with Finnish placeholder titles; `UpdateBanner` for new versions.

**Done when:** the deployed URL installs to a phone home screen and opens offline (empty screens).

### M1 — Data + add wine (≈1 h)
- Dexie schema per `CLAUDE.md`; `navigator.storage.persist()` on first launch.
- Add/Edit screen: photo picker (`<input type="file" accept="image/*" capture="environment">`),
  compression to photo (1200 px) + thumb (300 px), name, type, grape, country, region, vintage,
  price, store, star rating, notes, food, buy-again toggle, tasted date (default today).
- Grape and country fields autocomplete from `knowledge.json` keys (free text still allowed).
- Validation: only name and type required.

**Done when:** a wine with photo can be added, edited and deleted, and persists after reload offline.

### M2 — List, search, wine card, summaries (≈1 h)
- Home: journal summary card at top, then list (thumb, name, type, stars), newest first.
- Search (name, producer, grape, notes) and filter chips: type, ★4+, buy again; sort by date / rating / price.
- Wine card: large photo, summary sentence, all fields, edit/delete (with confirm).
- `lib/summaries.ts`:
  - `wineSummary(w)` → e.g. "Chileläinen Carménère 2021 · ★4 · 12,90 € (Alko). Söit sen kanssa: pihvi."
  - `journalSummary(wines, now)` → wines this month, top grape by average rating (min 2 wines),
    best value (rating ÷ price), latest buy-again pick.
  - Handles missing fields gracefully (no "undefined", no empty separators).

**Done when:** summaries read naturally in Finnish for full and sparse entries; unit tests cover both.

### M3 — Knowledge base + stats (≈45 min)
- `public/knowledge.json` with ~40 common grapes and ~30 regions. Each grape: Finnish description
  (2–3 sentences), body (kevyt/keskitäyteläinen/täyteläinen), 3–5 aromas, 3–4 food pairings, serving
  temperature °C, color (red/white). Each region: country, Finnish description, typical grapes.
- Lookup is case- and accent-insensitive and supports common aliases (Shiraz/Syrah, Pinot Grigio/Gris).
- Wine card shows an "Tietoa viinistä" section only when a match exists.
- Stats screen: total wines, average rating, average price, top 5 wines, top grapes and countries
  (count + avg rating), best value list. Simple CSS bars, no chart library.

**Done when:** a logged Malbec from Mendoza shows grape + region info offline; stats match test data.

### M4 — Backup, polish & phone testing (≈30 min)
- Settings: export ZIP (`wines.json` + `photos/<id>.jpg`) via Web Share API with download fallback;
  import ZIP with "replace" or "merge" choice and a confirmation step.
- Show storage persistence status and last backup date; gentle reminder on Home if no backup in 30 days.
- Install instructions screen (iPhone: Share → Lisää Koti-valikkoon; Android: Asenna sovellus).
- Seed option: "Lisää esimerkkiviinit" for the demo, removable in one tap.
- Test pass on the real phone type (see Test plan).

**Done when:** export → wipe → import restores all wines and photos exactly.

### M5 — First gift update: label reading (later)
- Lazy-load Tesseract.js with `fin+eng` data cached by the service worker.
- After taking a photo, show recognised words as tappable chips; tapping fills the focused field.
- Detect 4-digit years 1950–current as vintage suggestions.

**Done when:** OCR works offline after first use and never blocks saving if it fails.

### Backlog (future updates)
- "Mitä avaisin tänään?" — pick a food, get matches from his own wines + knowledge pairings.
- Optional sync to his Google Sheet via Google Apps Script (still free).
- Optional AI summaries through a Cloudflare Worker proxy (only feature needing internet).
- Wishlist ("haluan maistaa") and Alko product links.

---

## Test plan
- **Offline:** install, enable airplane mode, add/edit/search/backup — everything works.
- **iPhone:** always launch from the home-screen icon (separate storage from Safari); check camera,
  safe-area insets, standalone display.
- **Android Chrome:** install prompt, camera, share sheet export.
- **Data safety:** deploy a new version → data intact; export/import round trip.
- **Usability:** hand the phone to dad, ask him to log a wine with no instructions; fix what confuses him.

## Risks & mitigations
| Risk | Mitigation |
|---|---|
| Browser clears storage | `storage.persist()`, backup reminder, easy export |
| iPhone storage split (Safari vs home screen) | Install guide; detect non-standalone mode and show a hint |
| Large photos fill storage | Compress to ≈200 KB + thumbnails |
| Not finished in time for the gift | Ship M0–M2 first; give a card promising the rest as updates |

## Gift delivery
1. Deploy, install on dad's phone together, add his favourite wine as the first entry.
2. Give a small card: "Versio 1.0 — päivitykset tulossa: etikettien luku, illan viinisuositus."
