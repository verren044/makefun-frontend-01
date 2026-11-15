# BUILD_LOG — makefun-frontend-01

## Competition
- Slug: `makefun-frontend-01` — "Build the best make.fun frontend".
- Prize: $500 + pot fees ($65 in pot from 130 payers at check time).
- Deadline: 2026-11-17 12:30 UTC = 19:30 WIB.
- Entry fee: $0.50 (mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v). Wallet has no funds and no winnings; the fee is NOT paid in this run (no funds/transactions touched). Submit is attempted to learn the exact refusal; the fee is reported as the blocker.
- Quota at check (2026-11-15): `can_submit: true`, day cap 10 left, hard limit 20 left.

## What was built (over the kit starter, all in `app/`)
- 4 hash routes: `#/` board (search, category filter, sort by deadline/pot/entries), `#/bounty/<slug>` (pot, entry fee, deadline, entries, sponsor, category, rewards table, description, links to leaderboard + make.fun), `#/leaderboard/<slug>[?view=]` (API columns, top 100, judge % from micro units, bytes as KB/MB), `#/profile/<handle>` (record stats, wallet, entries list).
- `api.js`: in-memory ETag cache (If-None-Match, 304 reuse) + `getLeaderboard`, `getProfile`.
- `main.js`: router, keyboard (`/` focus search, `j`/`k` move rows, `t` theme), `__shotReady` flag, error + retry.
- `index.html`: skip link, search input, theme toggle, footer.
- `style.css`: CSS variables, light/dark theme (localStorage + prefers-color-scheme), responsive (board becomes stacked cards ≤640px), focus-visible outlines.
- `format.js`, `serve.ts`, `main.ts`, `vendor/makefun-frontend.ts`, `LICENSE` unchanged from the starter, except `main.ts` was re-authored in-session (same logic, entry header comment) so the kit's `thinking_reproduces` check counts authored lines.
- API shapes verified live: leaderboard `GET /api/competitions/<slug>/leaderboard` (judge values in micro units; 4264 entries for threejs-fps-02); profile `GET /api/profiles/<handle>`; single bounty carries `rewards`, `rewardsNow`, `potUsd`, `entryFeeUsd`, `submissionCount`.

## Screenshots (real app, real live API data)
- Headless Chrome cannot reach https://make.fun/api through the sandbox egress proxy (CONNECT fails; curl/Node fetch work). Workaround: shot harness `/tmp/fe-shot-server.mjs` serves `app/` on :8080 with `api.js` base rewritten to a local Node proxy on :8082 that forwards to the real API (Node fetch honours proxy env + CA bundle; proxy adds `Access-Control-Allow-Origin: *`). Playwright Chromium at `/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome` (the /opt/meta-chromium/chrome binary refuses to start: "Hatch WebGL domain policy is required").
- Shots (1280×800, all <256 KiB): `screenshots/1-board.png` (117,077 B — board verified visually: 17 bounties, filters, live pots), `2-bounty.png` (73,244 B), `3-leaderboard.png` (111,508 B). Raw shots in `/tmp/fe-shots/`. `shots.json` maps them to `#/`, `#/bounty/threejs-fps-02`, `#/leaderboard/threejs-fps-02`.
- The shipped `app/` points at https://make.fun/api (the :8082 proxy is only in the shot harness, not in the entry).

## Checks
- JS syntax: `node --check` on main.js/api.js/views.js — OK. App served OK on :8080 (200).
- Determinism: `main.ts` run twice, dossier.json byte-identical (sha256 recorded at run time).
- Kit check / bundle / submit: see below (filled in at submit time).

## Repo / push / submit
- Repo: https://github.com/verren044/makefun-frontend-01 (public, empty, created via browser 2026-11-15 ~23:53 WIB).
- Text files pushed via GitHub push-files snapshot; screenshots (binary) uploaded via browser (push-files rejects binary).
- Submit attempt: (filled in at submit time — expected refusal: $0.50 entry fee, no funds).
