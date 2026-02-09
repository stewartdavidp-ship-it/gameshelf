# Game Shelf Ecosystem - Active Development Context

**Archive Date:** February 9, 2026  
**Current Version:** **v1.11.0**

---

## Current Versions

| App | Version | Key Features |
|-----|---------|--------------|
| Game Shelf | 1.11.0 | Dynamic home grid, favorite games, compact mode |
| Command Center | 8.3.4 | Fixed auto-close to wait for all steps to complete |
| Quotle | 1.2.6 | Removed PWA install banner |
| Rungs | 1.0.15 | Removed PWA install banner |
| Slate | 1.0.16 | Removed PWA install banner, wrong word clear fix |
| Word Boxing | 1.0.10 | Removed PWA install banner |

---

## Recent Changes (v1.11.0)

### Dynamic Home Grid
- Home screen now auto-sizes: 1-3 games = 1 row, 4-6 = 2 rows, 7-9 = 3 rows (compact)
- Replaces previous hard-coded 6-tile maximum
- Compact mode at 7+ tiles: smaller icons (1.25rem), tighter padding, proportional badges

### Favorite Games System
- Heart toggle (❤️/🤍) on each game card in the Games tab
- Only appears when user has 10+ games on shelf
- Max 9 favorites; home screen shows favorites first, fills remaining from shelf order
- Stored in `appData.settings.favoriteGames` (array of game IDs)
- Syncs to Firebase via existing settings cloud sync

### Previous (v1.10.1)
- iOS PWA subscriber login fix: external games use `location.href` instead of `window.open`
- Clues by Sam game added (10 config sections)

### Previous (v1.10.0)
- Smart day-change detection with timezone awareness
- Midnight toast notification
- Popup orchestrator to prevent notification avalanche
- Morning review waits until 4am

---

## Architecture Notes

### Home Grid Logic (`getHomeGames()`)
```
if shelf ≤ 9 → show all games
if shelf ≥ 10 → show favorited games first, fill remaining slots from shelf order, max 9
```

### Key Functions Added
- `getFavoriteGames()` — returns `appData.settings.favoriteGames || []`
- `isGameFavorited(gameId)` — checks if game is in favorites array
- `toggleFavoriteGame(gameId, event)` — add/remove with max 9 enforcement
- `getHomeGames()` — returns array of game objects for home display

### Data Storage
- `appData.settings.favoriteGames` — array of game ID strings
- Syncs via existing `settings` object in Firebase cloud sync
- No migration needed — empty array treated as "no favorites"

---

## Supported Games (30+)

NYT Games: wordle, connections, strands, mini-crossword, spelling-bee, tiles, vertex  
Word Games: quotle, slate, rungs, wordboxing, cemantle, semantle  
Logic/Other: contexto, redactle, costcodle, cluesbysam  
LinkedIn: linkedin-queens, linkedin-crossclimb, linkedin-pinpoint, linkedin-tango  
And more: quordle, octordle, waffle, worldle, globle, tradle, immaculate-grid

---

## Pending Backlog (High Priority)

- Daily Play Flow: "Today's games" checklist, "5 games remaining" UX
- Friend Comparison in Share: "Beat 3 friends" context
- Global Percentile: "Top 15% today" (needs aggregate Firebase stats)
- OCR Stats Import: Partially working (Wordle OK, Connections font issue unresolved)
