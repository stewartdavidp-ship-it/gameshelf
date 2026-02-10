# Game Shelf — Project Plan

## Mission

Provide a single, beautiful hub for daily puzzle game enthusiasts to track all their games, compete with friends, and discover new puzzles.

## Completed Features

### Core Platform
- [x] Multi-game share text parsing (30+ games supported)
- [x] Daily score logging with emoji grid preservation
- [x] Streak tracking per game (current + max)
- [x] Firebase cloud sync (offline-first, merge on reconnect)
- [x] PWA with service worker (installable, offline capable)
- [x] Anonymous auth → Google sign-in upgrade path

### Home & Navigation
- [x] Dynamic home grid (auto-sizes 1-9 tiles)
- [x] Favorite games system (heart toggle, top 9 for 10+ games)
- [x] 5-tab navigation (Home, Games, Stats, Social, Share)
- [x] Quick game launch from home tiles
- [x] Streak fire indicators on game cards

### Games Tab
- [x] Shelf management (add/remove games)
- [x] Browse by category (Word, Logic, Geography, etc.)
- [x] Game recommendations engine
- [x] Long-press game options menu
- [x] Search across all games

### Stats & Analytics
- [x] Per-game statistics (played, won, streaks)
- [x] Overall dashboard with trends
- [x] Game timing tracking
- [x] Sprint system (timed puzzle sessions)
- [x] Sprint scheduling with reminders

### Social
- [x] Friend system (friend codes, contact matching)
- [x] Daily battles (challenge friends, compare scores)
- [x] Leaderboards
- [x] Nudge system (remind friends to play)
- [x] Public profiles

### AI Hints
- [x] Anthropic Claude-powered hints for select games
- [x] 10-level hint system (Whisper → Answer)
- [x] Token economy for hint usage
- [x] Firebase Cloud Function proxy (domainProxy)

### Economy
- [x] Token wallet (earn by playing, spend on hints)
- [x] Coin system
- [x] Achievement system with unlockables

### Original Games (Hosted in Ecosystem)
- [x] Quotle — Daily quote guessing
- [x] Slate — Word puzzle on 8x5 grid
- [x] Rungs — Word ladder ranking
- [x] Word Boxing — Multiplayer word game

## In Progress

- [ ] Command Center App Files view improvements (v8.35.0)
- [ ] Testing new CC deploy workflow with Game Shelf packages

## Planned Features

### Near Term
- [ ] Improved share text parsing for edge cases
- [ ] Additional game parsers as new games are discovered
- [ ] Better onboarding for new users

### Medium Term
- [ ] Weekly/monthly recap summaries
- [ ] Game groups (create custom groups beyond categories)
- [ ] Expanded battle types (weekly challenges, tournaments)
- [ ] Push notifications for battle invites and nudges

### Future / Ideas
- [ ] Public shareable profile pages
- [ ] Integration with game APIs (where available)
- [ ] Community-contributed game parsers
- [ ] Puzzle difficulty ratings based on community data
- [ ] Achievement showcase / trophy case
- [ ] Dark/light theme toggle

## Architecture Decisions

### Single-File HTML
All code lives in one index.html. This simplifies deployment (just push one file), avoids build steps, and works well with the GitHub Pages + Command Center workflow. Tradeoff: file is large (~44K lines) but gzip compression keeps transfer size manageable.

### Offline-First with Cloud Sync
localStorage is the source of truth. Cloud sync is additive (merge, never overwrite). This means the app works instantly on load and never blocks on network. Cloud data merges field-by-field with conflict resolution per data type.

### Firebase Anonymous Auth
Users start anonymous (zero friction). Can upgrade to Google Sign-In to enable cross-device sync and social features. Anonymous data persists through the upgrade.

### Parser-Based Share Text Ingestion
Each game has a dedicated regex parser rather than a generic AI-based parser. This is faster, works offline, and is deterministic. Tradeoff: each new game needs a custom parser added manually.

### Heart Favorites via Event Delegation (v1.11.1)
Hearts use `addEventListener` after render instead of inline `onclick`. This prevents click propagation to parent game card, which was causing accidental game launches when trying to favorite.

## Open Questions

- Should we add a "compact mode" option for users who want denser game grids?
- How to handle games that change their share text format without breaking existing parsers?
- Should sprint scheduling support different schedules per day of week?
