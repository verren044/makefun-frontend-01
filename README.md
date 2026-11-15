# make.fun frontend

Entry for the **makefun-frontend-01** bounty ($500 + pot fees, deadline 17 Nov 2026 19:30 WIB): a fast, keyboard-friendly frontend for browsing make.fun bounties, leaderboards and profiles — plain static files, no build step, no framework.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Routes

- `#/` — bounty board: live list from `https://make.fun/api`, text search, category filter, sort by deadline / pot / entries.
- `#/bounty/<slug>` — bounty detail: pot, entry fee, deadline, submission count, sponsor, category, rewards table, description, links to the leaderboard and to make.fun.
- `#/leaderboard/<slug>[?view=]` — leaderboard: columns straight from the API, top 100 entries, judge scores converted from micro units, sizes shown as KB/MB.
- `#/profile/<handle>` — profile: record stats (entered / placed / won, best placement, prize USD), wallet, entries list.

## Details

- `app/api.js` — API client with an in-memory ETag cache (`If-None-Match`, 304 reuse) plus `getLeaderboard` and `getProfile`.
- `app/main.js` — hash router, keyboard shortcuts (`/` focuses search, `j`/`k` move rows, `t` toggles theme), `__shotReady` flag for screenshots, error state with retry.
- `app/style.css` — CSS variables, light/dark theme (localStorage + `prefers-color-scheme`), responsive layout (board becomes stacked cards at ≤640px), `focus-visible` outlines.
- `app/index.html` — skip link, search input, theme toggle, footer.

## Screenshots

`screenshots/` holds 3 PNGs (1280×800, each under 256 KiB) of the real app running on live make.fun API data: the board, a bounty page, and a leaderboard. `shots.json` maps each file to its route.

## Submission

- Repo: https://github.com/verren044/makefun-frontend-01
- Entry fee: $0.50 (see BUILD_LOG.md — submit attempt and fee status).
- `main.ts` (Node 22, stdlib only) copies `app/` + `screenshots/` to `/output` and writes `dossier.json` via the vendored `vendor/makefun-frontend.ts`.
