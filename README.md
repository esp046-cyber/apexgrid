# ApexGrid — F1 2026 Abu Dhabi Grand Prix & Monthly Top 10 Drivers Hub

[![Live on GitHub Pages](https://img.shields.io/badge/live-GitHub%20Pages-e10600?logo=github)](https://esp046-cyber.github.io/apexgrid/)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?logo=pwa&logoColor=white)](https://esp046-cyber.github.io/apexgrid/)
[![Service Worker](https://img.shields.io/badge/service%20worker-offline--first-0d9488)](#offline-behaviour)
[![Vanilla JS](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20vanilla%20JS-f7df1e?logo=javascript&logoColor=black)](#architecture)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

**Live app:** <https://esp046-cyber.github.io/apexgrid/>

ApexGrid is an installable, offline-capable Progressive Web App covering the 2026 Formula 1 season finale at Yas Marina, the 2026 technical regulations, and monthly Top 10 driver standings. It has no build step, no framework and no runtime dependencies.

> **Data snapshot:** standings and race facts in this document were checked on **2 November 2026**, after the Mexico City Grand Prix. This is an unofficial fan project, not affiliated with Formula 1, the FIA or any team.

## Contents

1. [The 2026 Abu Dhabi Grand Prix](#1-the-2026-abu-dhabi-grand-prix)
2. [2026 cars: chassis and aerodynamics](#2-2026-cars-chassis-and-aerodynamics)
3. [Power unit architecture](#3-power-unit-architecture)
4. [Top 10 drivers and monthly snapshots](#4-top-10-drivers-and-monthly-snapshots)
5. [Features](#5-features)
6. [Architecture](#architecture)
7. [Local development](#local-development)
8. [Deploying to GitHub Pages](#deploying-to-github-pages)
9. [Updating standings (race-weekend runbook)](#updating-standings-race-weekend-runbook)
10. [Testing the PWA](#testing-the-pwa)
11. [Social sharing and link previews](#social-sharing-and-link-previews)
12. [Data accuracy notes](#data-accuracy-notes)
13. [License](#license)

---

## 1. The 2026 Abu Dhabi Grand Prix

| Item | Detail |
|---|---|
| Official title | Formula 1 Etihad Airways Abu Dhabi Grand Prix 2026 |
| Circuit | Yas Marina Circuit, Yas Island, Abu Dhabi, United Arab Emirates |
| Lap length | 5.281 km |
| Race distance | 58 laps, 306.183 km |
| Corners | 16 |
| Lap record | 1:26.103, Max Verstappen (2021) |
| Dates | 4–6 December 2026 |
| Race | Sunday 6 December 2026, scheduled for 17:00 local time (13:00 GMT) |
| Format | Standard weekend: three practice sessions, qualifying, race. **No sprint.** |
| Tyres | Pirelli C3 (Hard), C4 (Medium), C5 (Soft) |
| Position in season | Final race of the 2026 calendar |

Session times can change. Confirm them on the official Formula 1 site before planning around them.

**Round numbering.** Official team and promoter pages list Abu Dhabi as Round 24 and the final race. Some outlets number the 2026 rounds differently, so ApexGrid labels it "Season Finale" and avoids round numbers in the app.

### Championship context

- **Drivers' title: decided.** Andrea Kimi Antonelli (Mercedes) clinched the 2026 World Drivers' Championship by finishing third in the Mexico City Grand Prix on 1 November 2026. At 20 years, 2 months and 7 days he is the youngest world champion in Formula 1 history, beating Sebastian Vettel's 2010 record.
- **Fight for P2–P5.** After Mexico City the runners-up spots are tight: Max Verstappen 261, Lewis Hamilton 259, George Russell 250, Charles Leclerc 245 (Lando Norris is on 221). Three races remain before Abu Dhabi: São Paulo, Las Vegas and Qatar.
- **Constructors' title.** Mercedes leads with 630 points after Mexico City; Ferrari is second. The title could be settled before the finale.

### Track characteristics and strategy

- **Back straight (about 1.2 km):** the longest full-throttle section. Under the 2026 rules this is where straight-line aero mode is used and where battery deployment tapers off, so energy management decides top speed at the end of the straight.
- **Braking zones:** the Turn 5 hairpin at the end of the back straight is the primary overtaking opportunity, alongside the braking zone into Turn 1 at the end of the start-finish straight.
- **Final sector:** slow, traction-limited corners around the marina. Corner-exit deployment matters more than peak downforce here.
- **Setup:** medium-downforce packages are typical, balancing the long straights against the technical final sector.
- **Tyres:** the 2026 allocation is C3/C4/C5, as in 2025. Race strategy will be decided by tyre degradation data gathered during the weekend.
- **Evening race:** the race runs from late afternoon into darkness under floodlights, so track temperatures fall during the race.

---

## 2. 2026 cars: chassis and aerodynamics

The 2026 FIA Technical Regulations produce smaller, lighter, more agile cars.

| Parameter | 2025 | 2026 |
|---|---|---|
| Maximum car width | 2000 mm | 1900 mm |
| Maximum wheelbase | 3600 mm | 3400 mm |
| Minimum weight | about 798–800 kg | 768 kg (about 30 kg lighter) |

### Active aerodynamics

Movable front **and** rear wing elements replace the single-flap hydraulic DRS.

| Mode | Purpose | Notes |
|---|---|---|
| **Corner Mode** (earlier called "Z-Mode") | High-downforce baseline | Default configuration for braking zones and cornering. |
| **Straight Mode** (earlier called "X-Mode") | Low-drag configuration | Available to every car in the designated activation zones, not just the chaser. |
| **Overtake Mode** (formerly "Manual Override Mode", MOM) | Overtaking aid | A *power* boost, not a wing setting. See below. |

The names "X-Mode" and "Z-Mode" were used when the FIA first presented the rules; the FIA and teams later moved to Straight Mode and Corner Mode. ApexGrid uses the current terms.

**Overtake Mode** applies to a car within one second of the car ahead at the activation point. It extends full 350 kW MGU-K deployment up to **337 km/h**, where a normal car's deployment starts tapering at about 290 km/h, and adds **+0.5 MJ** of extra deployable energy. It replaces the role DRS played in overtaking but it is an electrical boost rather than a wing flap.

In wet conditions race control can enable a partial aero mode, with front elements in straight mode and the rear wing in corner mode.

---

## 3. Power unit architecture

| Item | 2026 specification |
|---|---|
| Internal combustion engine | 1.6 L V6 turbo, about 400 kW (about 536 hp) |
| Electric (MGU-K) | 350 kW (about 470 hp), up from 120 kW |
| Total output | Over 1,000 hp combined |
| MGU-H | **Removed** |
| Energy recovery | About 8.5 MJ per lap |
| Fuel | 100% advanced sustainable fuel; flow is limited by **energy** (3,000 MJ/h) rather than mass |
| Compression ratio | 16:1 (geometric) |

The power split is close to 50/50 between combustion and electric power. Removing the MGU-H lowers cost and complexity and makes the MGU-K the main hybrid component, which is why energy management dominates 2026 strategy.

### Engine supplier matrix

| Power unit supplier | Teams |
|---|---|
| Mercedes High Performance Powertrains | Mercedes-AMG Petronas, McLaren, Williams, Alpine |
| Ferrari | Scuderia Ferrari HP, Haas, Cadillac |
| Red Bull Ford Powertrains (DM01) | Oracle Red Bull Racing, Visa Cash App Racing Bulls |
| Honda Racing Corporation | Aston Martin Aramco |
| Audi | Audi Revolut F1 Team (own power unit, built in Neuburg) |

---

## 4. Top 10 drivers and monthly snapshots

### November 2026 (after the Mexico City GP, 1 November)

| # | Driver | Team | Car | Engine | Pts | Profile and 2026 milestones |
|---|---|---|---|---|---:|---|
| 1 | Andrea Kimi Antonelli | Mercedes-AMG Petronas | W17 | Mercedes | 380 | **2026 World Champion**, youngest ever. Italian prodigy in his second F1 season; leader since the Japanese GP. |
| 2 | Max Verstappen | Oracle Red Bull Racing | RB22 | Red Bull Ford DM01 | 261 | Four-time champion (2021–2024). Won the Mexico City GP and the Singapore sprint; holds the Yas Marina lap record. |
| 3 | Lewis Hamilton | Scuderia Ferrari HP | SF-26 | Ferrari | 259 | Seven-time champion in his second Ferrari season. First Ferrari podium in China, Barcelona-Catalunya winner, second in Mexico. |
| 4 | George Russell | Mercedes-AMG Petronas | W17 | Mercedes | 250 | Won the season opener in Australia and the Azerbaijan GP. Qualifying specialist. |
| 5 | Charles Leclerc | Scuderia Ferrari HP | SF-26 | Ferrari | 245 | Strong second-half recovery; second in the US GP. Single-lap specialist. |
| 6 | Lando Norris | McLaren Mastercard | MCL40 | Mercedes | 221 | Reigning (2025) world champion. Won the Hungarian GP. |
| 7 | Oscar Piastri | McLaren Mastercard | MCL40 | Mercedes | 144 | Led the 2025 title race for long stretches. Missed the 2026 opener after a sighting-lap crash. |
| 8 | Isack Hadjar | Oracle Red Bull Racing | RB22 | Red Bull Ford DM01 | 107 | Promoted from Racing Bulls to partner Verstappen for 2026. |
| 9 | Liam Lawson | Visa Cash App Racing Bulls | VCARB 03 | Red Bull Ford DM01 | 83 | Racing Bulls' leading driver; hard wheel-to-wheel racer. |
| 10 | Pierre Gasly | BWT Alpine | A526 | Mercedes | 42 | Alpine's lead driver, scoring after the team's Zandvoort aero upgrade. |

### Monthly points snapshots

| Driver | Sep 2026 (after Azerbaijan GP) | Oct 2026 (after US GP) | Nov 2026 (after Mexico City GP) |
|---|---:|---:|---:|
| Antonelli | 302 | 365 | 380 |
| Verstappen | 163 | 236 | 261 |
| Hamilton | 199 | 241 | 259 |
| Russell | 236 | 242 | 250 |
| Leclerc | 179 | 233 | 245 |
| Norris | 186 | 211 | 221 |
| Piastri | 120 | ≈144 | 144 |
| Hadjar | 86 | ≈105 | 107 |
| Lawson | 59 | ≈77 | 83 |
| Gasly | 41 | ≈42 | 42 |

`≈` marks points derived from the next published table minus that race's points, rather than read from a published table. These are flagged in `data/standings.json` as `"points_approx": true`.

Note that Verstappen did not defend a title in 2026: Norris was the 2025 champion, and Verstappen's 2026 story is a late-season climb to P2.

---

## 5. Features

- Three tabs: Abu Dhabi GP, Top 10 Drivers (September, October, November), 2026 Tech & Specs.
- Installable on Android, desktop Chrome/Edge, and iOS (via Add to Home Screen).
- Works offline after the first visit.
- Standings load from `data/standings.json` with skeleton loaders, an empty state, and an error state with retry.
- Rank-change arrows between monthly snapshots, gap to leader, and clear marking of approximate values.
- Accessible: keyboard tab navigation, skip link, ARIA roles, WCAG AA contrast targets, reduced-motion support.
- Mobile-first layout with safe-area insets and 44 px minimum tap targets.

## Architecture

```text
apexgrid/
├── index.html            App shell, tabs, iOS meta and splash links
├── styles.css            Dark theme, 4/8pt spacing tokens, states
├── app.js                Tabs, data loading, rendering, install flow
├── sw.js                 Service worker (precache, network-first data)
├── manifest.json         Web App Manifest
├── offline.html          Fallback for uncached navigations
├── data/standings.json   Three monthly Top 10 snapshots (schema v2)
├── icons/                PNG icons, SVG icon, iOS splash screens
├── social/               Link-preview images and share templates
├── tools/generate-assets.js   Regenerates icons and splash screens
├── metadata.json         Web, OpenGraph and social metadata reference
└── .github/workflows/pages.yml   GitHub Pages deployment
```

All asset URLs are relative, so the app works from the `/apexgrid/` sub-path on GitHub Pages as well as from a local server root.

### Offline behaviour

- The app shell, styles, script, icons and last-fetched standings are precached or cached on first use.
- Page loads: network first, falling back to the cached app shell. An uncached page falls back to `offline.html`.
- Standings: network first, cached copy when offline.
- A new service worker takes control immediately and the page reloads once, so old code never runs against new data.

---

## Local development

Requires Node.js 18 or newer (only for the static server and the optional asset script).

```bash
git clone https://github.com/esp046-cyber/apexgrid.git
cd apexgrid
npx serve -l 8080 .
```

Open <http://localhost:8080>. `localhost` counts as a secure context, so the service worker and install prompt work without HTTPS. Python also works: `python3 -m http.server 8080`.

For local HTTPS (testing on a phone over your network):

```bash
mkcert -install && mkcert localhost
npx serve -l 8443 --ssl-cert localhost.pem --ssl-key localhost-key.pem .
```

### Regenerating icons and splash screens

```bash
npm install --no-save sharp
node tools/generate-assets.js
```

Do not commit `node_modules/`.

## Deploying to GitHub Pages

**Option A: deploy from a branch (simplest).**

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. After a minute the site is live at <https://esp046-cyber.github.io/apexgrid/>.

**Option B: GitHub Actions.** In **Settings → Pages**, set the source to **GitHub Actions**. The workflow in `.github/workflows/pages.yml` publishes on every push to `main`.

GitHub Pages serves every file over HTTPS, which satisfies the service worker and install requirements. You cannot set custom HTTP headers on GitHub Pages. That is fine here: browsers check `sw.js` for updates on every navigation, and the app fetches `data/standings.json` with `cache: 'no-cache'`.

## Updating standings (race-weekend runbook)

1. **Edit `data/standings.json`.** Update `points`, `rank` and `status` for the relevant month, set `updated`, and mark any derived value `"points_approx": true`. Validate the JSON before committing.
2. **Bump the cache version in `sw.js`:**
   ```bash
   sed -i "s/^const CACHE_NAME = .*/const CACHE_NAME = 'apexgrid-v$(date +%Y%m%d%H%M)';/" sw.js
   ```
3. **Commit and push.** After Pages deploys, open the live site and confirm the new numbers. In DevTools → Application → Cache Storage the new `apexgrid-v…` cache should exist and the old one should be gone.

If you only change `standings.json`, step 2 is optional because standings load network-first. Bump the cache whenever any other file changes. GitHub Pages applies a short HTTP cache (about 10 minutes) to static files, so assets other than `sw.js` and the standings file can take a few minutes to refresh.

## Testing the PWA

Current Lighthouse versions no longer include a separate PWA category, so use these checks:

1. **Chrome DevTools → Application → Manifest.** Confirm the installability section shows no errors and the maskable icon is recognised.
2. **Application → Service Workers.** The worker should be "activated and running"; tick **Offline** and reload to confirm the cached app loads.
3. **Lighthouse (Performance, Accessibility, Best Practices, SEO).** Run it against the live URL; this project does not publish score badges because a badge would need to track your own latest run.
4. **iOS.** In Safari, Share → Add to Home Screen, then launch from the home-screen icon to confirm standalone mode and the splash screen.
5. **Maskable icon safe zone.** Upload `icons/icon-maskable-512.png` to <https://maskable.app/editor>.

## Social sharing and link previews

Rich previews for WhatsApp, Telegram, Messenger/Facebook, Discord, Slack and X depend on `<meta>` tags in `index.html`. This repository ships:

- `metadata.json` — all web, OpenGraph, Twitter and JSON-LD metadata in one reference file.
- `social/og-meta-tags.html` — the exact `<head>` tags to paste into `index.html`.
- `social/og-image.png` (1200×630) and `social/og-square.png` (600×600) — preview images, each under 40 KB.
- `social/share-templates.md` — ready-to-send messages and share URLs for each platform, plus how to refresh a stale preview.

Previews only work after the tags are in `index.html`, the site is deployed, and the image URLs resolve publicly.

## Data accuracy notes

- Standings were cross-checked against published results tables on 2 November 2026.
- October positions 7–10 are derived (marked `≈`).
- The McLaren chassis name (MCL40) and power-unit entries by manufacturer (rather than internal engine codes) were not independently confirmed against FIA documents.
- Round numbering for the 2026 calendar differs between sources, so the app avoids it.
- Session timings and race-weekend details can change; check formula1.com for official information.

## License

MIT. Add a `LICENSE` file containing the MIT license text and your name before publishing. Formula 1, F1, team and driver names and marks belong to their respective owners; ApexGrid is an unofficial fan project and uses them only for identification.
