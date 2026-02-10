# Game Shelf — Changelog

All notable changes to the Game Shelf PWA.

## [1.11.1] — 2026-02-10

### Fixed
- Heart favorite toggle no longer triggers game card click (switched from inline onclick to addEventListener with stopPropagation)
- Increased heart tap target with 8px padding and z-index: 10 for reliable mobile tapping
- Clues by Sam parser: regex now matches `#CluesBySam` hashtag format (previously only matched `Clues by Sam` with spaces)

### Changed
- Tab switching now refreshes destination screen (home renders games/quick games, games tab renders shelf)
- Clues by Sam parser captures time from header line ("in less than 12 minutes") and difficulty (Easy/Medium/Hard)
- Clues by Sam score display now includes time (e.g., "19/20 12m")
- Added `#cluesbysam` to STATS_GAME_KEYWORDS for detection

## [1.11.0] — 2026-02-09

### Added
- Dynamic home grid: auto-sizes to 1 row (1-3 games), 2 rows (4-6), compact 3 rows (7-9)
- Favorite games system: heart toggle on game cards when 10+ games on shelf
- MAX_FAVORITES (9) — favorited games shown first on home screen, remaining slots filled from shelf order
- Compact CSS class for 7+ tile home grid

### Changed
- External games on iOS PWA now open in Safari (preserves logins and subscriptions)
- Home screen "See All" shows count of additional games not displayed

## [1.10.0] — 2026-02-06

### Added
- Smart day detection: app detects midnight crossover and resets daily state automatically
- Midnight toast notification when new day starts
- Coordinated popup system: morning review, sprint prompts, and notifications are sequenced

### Changed
- Morning review waits until 4am to appear (late-night sessions don't trigger next-day review)

## [1.9.9] — 2026-02-04

### Fixed
- Sprint scheduling reliability improvements
- Minor UI polish across settings screens

## [1.9.5] — 2026-02-01

### Added
- Sprint home banner showing active/upcoming sprint status
- Sprint scheduling with customizable days and times

### Changed
- Sprint stats tracking: best times per duration, streak tracking
