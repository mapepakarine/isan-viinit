# Kickoff prompts for Claude Code

Open this folder in a terminal and run `claude`. Paste one prompt per milestone, review, commit, then continue.

## M0 — Setup & deploy
```
Read CLAUDE.md and docs/PROJECT_PLAN.md. Implement milestone M0 only.
Scaffold the Vite + React + TS + Tailwind project in this folder (keep CLAUDE.md, docs/ and KICKOFF.md),
set up HashRouter with empty Finnish-titled routes, vite-plugin-pwa with manifest and placeholder icons,
the UpdateBanner, and a GitHub Actions workflow that deploys dist/ to GitHub Pages.
Repo name will be "isan-viinit". Follow the definition of done, then stop and summarize.
```

## M1 — Data + add wine
```
Implement milestone M1 from docs/PROJECT_PLAN.md. Start with db/ and lib/image.ts (with tests),
then the AddEditWine screen and PhotoPicker. Create a minimal public/knowledge.json with 5 grapes
and 5 regions for autocomplete; M3 will expand it. Stop and summarize when done.
```

## M2 — List, search, wine card, summaries
```
Implement milestone M2. Write lib/summaries.ts test-first, covering full and sparse wines and
Finnish number/price formatting (12,90 €). Then build Home, WineListItem, FilterChips,
SummaryCard and WineCard. Stop and summarize.
```

## M3 — Knowledge base + stats
```
Implement milestone M3. Expand public/knowledge.json to ~40 grapes and ~30 regions with accurate
Finnish descriptions, aliases and pairings. Add lib/knowledge.ts (normalized, alias-aware lookup)
and lib/stats.ts with tests, then the "Tietoa viinistä" section and the lazy-loaded Stats screen.
Stop and summarize.
```

## M4 — Backup, polish & phone testing
```
Implement milestone M4: lib/backup.ts (ZIP export/import, replace or merge) with a round-trip test,
Settings screen, backup reminder, install-instructions screen and sample-wine seeding.
Then give me a manual test checklist for my dad's phone. Stop and summarize.
```

## Tips
- Commit after every milestone (`git commit -am "M1 done"`) so you can roll back.
- Test on a phone over Wi-Fi with `npm run dev -- --host`.
- If short on time, ship M0–M2 as the gift and give the rest as updates.
