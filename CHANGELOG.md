# Game Shelf PWA Changelog

## [1.11.0] (February 9, 2026)

### Added
- **Dynamic Home Grid**: Home screen auto-sizes based on shelf count (1-3: 1 row, 4-6: 2 rows, 7-9: 3 rows)
- **Compact Card Mode**: At 7+ home tiles, cards use smaller icons (1.25rem), tighter padding, proportional badges
- **Favorite Games System**: Heart toggle (❤️/🤍) on Games tab cards for users with 10+ games
- **`getHomeGames()` function**: Central logic for determining which games appear on home screen
- **`toggleFavoriteGame()` function**: Add/remove favorites with max-9 enforcement and toast feedback

### Changed
- `renderHomeGames()` now uses `getHomeGames()` instead of `appData.games.slice(0, 6)`
- `renderQuickGames()` now uses `getHomeGames()` for consistency with home grid
- `renderShelfGames()` now renders heart icons when shelf has 10+ games
- "+X more" badge dynamically calculates overflow based on actual displayed count

### Data Model
- New: `appData.settings.favoriteGames` (array of game ID strings, max 9)
- Syncs via existing Firebase settings cloud sync — no migration needed

---

## [1.10.1] (February 9, 2026)

### Added
- **Clues by Sam** game: daily logic puzzle (🔍), integrated across all 10 config sections
- iOS PWA subscriber login fix: external games use `location.href` to open in Safari

### Changed
- `openGameUrl()` now accepts gameId parameter for iOS standalone detection
- First-time tip updated for external vs GS Original games

---

## [1.10.0] (February 8, 2026)

### Added
- Smart day-change detection with timezone awareness
- Midnight toast notification for new day
- Popup orchestrator to prevent notification avalanche
- Morning review waits until 4am

---

## v1.9.9 and earlier

See RELEASE_NOTES.txt for full history.
