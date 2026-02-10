# Game Shelf — CONTEXT.md

> **Read this first** at the start of every session.

## Current Version

**v1.11.1** — Released 2026-02-10

## What Game Shelf Is

Game Shelf is a PWA that tracks daily puzzle games (Wordle, Connections, Strands, etc.) in one place. Users paste share text from any supported game, and Game Shelf logs scores, tracks streaks, calculates analytics, and enables social features like battles and leaderboards. It also hosts four original games: Quotle, Slate, Rungs, and Word Boxing.

## Architecture

- **Single-file HTML app**: All CSS/JS inline in index.html (~44K lines)
- **Framework**: Vanilla JavaScript (no React/Vue)
- **Data**: Firebase Realtime Database (cloud sync) + localStorage (offline-first)
- **Auth**: Firebase Anonymous Auth, upgradeable to Google Sign-In
- **PWA**: Yes — sw.js (network-first caching) + manifest.json
- **AI**: Anthropic Claude API via Firebase Cloud Function proxy for game hints
- **Deploy target**: GitHub Pages at gameshelf.co/app (prod), gameshelftest/app (test)

## Key Technical Details

### Meta Tags (Required)
```html
<meta name="version" content="1.11.1">
<meta name="gs-app-id" content="gameshelf">
```

### Data Schema

**localStorage key**: `gameShelfData`

Core appData structure:
```javascript
{
  games: [{id, addedAt}],           // Shelf — ordered list of tracked games
  history: {date: {gameId: {score, won, numericScore, grid, shareText, meta}}},
  stats: {gameId: {currentStreak, maxStreak, totalPlayed, totalWon}},
  wallet: {tokens, coins},
  settings: {favoriteGames: [], theme, dailyGoal, ...},
  friends: [{uid, displayName, friendCode}],
  achievements: {achId: {unlockedAt}},
  gameTiming: {gameId: {totalSeconds, bestSeconds, avgSeconds, ...}},
  sprintStats: {totalSprints, completedSprints, best10min, ...},
  sprintSchedule: {enabled, days, time, ...}
}
```

**Firebase paths**:
- `users/{uid}/shelf` — Full appData backup
- `gameshelf-public/{uid}` — Public profile (name, scores, streaks)
- `friends/{uid}` — Friend list
- `nudges/{uid}` — Pending nudge notifications
- `battles/{battleId}` — Battle state and scores

### Key Components / Functions

**Tab System**: 5 tabs — Home, Games, Stats, Social, Share

| Area | Key Functions | Lines (approx) |
|------|--------------|-----------------|
| Share Text Parsing | `PARSERS[]`, `parseShareText()`, `parseMultipleGames()` | 17325-19470 |
| Game Registry | `GAMES{}` — all game definitions (id, name, icon, url) | 17191-17320 |
| Shelf Management | `addToShelf()`, `removeFromShelf()`, `renderShelfGames()` | 36760-31860 |
| Home Screen | `getHomeGames()`, `renderHomeGames()`, favorites system | 31670-31800 |
| Cloud Sync | `syncToCloud()`, `loadFromCloud()` — merge strategy | 20480-20650 |
| Hint System | `HINT_GAMES{}`, Anthropic API calls via domainProxy | 34435-34560 |
| Battle System | Challenge friends, compare daily scores | 15600-16800 |
| Sprint System | Timed puzzle sessions with scheduling | Various |
| Setup Wizard | First-run game selection flow | 41500-42200 |

### Share Text Parsers

The `PARSERS` array contains regex-based parsers for 30+ games. Each parser has:
- `id` — game ID matching GAMES registry
- `regex` — pattern to match share text format
- `extract(match, text)` — returns `{gameId, score, won, numericScore, meta}`

When adding a new game: add to `GAMES{}`, add parser to `PARSERS[]`, add to `STATS_GAME_KEYWORDS{}`, optionally add to hint system `HINT_GAMES{}`.

## Deployment

- **Prod Repo:** stewartdavidp-ship-it/gameshelf
- **Test Repo:** stewartdavidp-ship-it/gameshelftest
- **SubPath:** `app`
- **Structure:** Dual repo (test → prod), consolidated repo with other apps
- **Deploy type:** PWA package (index.html + sw.js + manifest.json + icons/)
- **Detection patterns:** `gameshelf`, `game-shelf`, `game shelf`

## Conventions

- **Offline-first**: All data saved to localStorage immediately, then synced to cloud
- **Cloud merge strategy**: Field-by-field merge, cloud wins for conflicts except wallet tokens (take higher)
- **Version locations**: 5 places — meta tag, header badge, settings display, APP_VERSION const, console log
- **sw.js CACHE_VERSION**: Must always match app version
- **CSS**: Inline styles with CSS custom properties (--accent-purple, --text-muted, etc.)
- **No build step**: Everything is vanilla JS, no transpilation
- **Mobile-first**: Designed for iOS PWA, touch targets ≥44px

## Recent Changes

**v1.11.1** — Heart tap fix (event delegation instead of inline onclick), tab switch refresh (renderHomeGames/renderShelfGames on tab change), Clues by Sam parser fix (#CluesBySam hashtag format + time/difficulty capture)

**v1.11.0** — Dynamic home grid (1-9 tiles auto-layout), favorite games system (heart toggle, top 9 for home when 10+ games), iOS Safari external game opening

**v1.10.0** — Smart day detection (midnight reset), morning review timing, coordinated popup system
