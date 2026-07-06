# Slate — CHANGELOG.md

All notable changes to Slate are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.23] - 2026-07-06

### Changed
- Renamed "Consonant Score" to "Word Cost" everywhere (score banner, tutorial, intro, menu, confirm dialog, toasts, end screen) — the number is the price each solved word adds to your Score, and the old name didn't say that. End-screen breakdown now reads "X clues + Y misses"
- sw.js CACHE_VERSION bumped to v1.0.23

---

## [1.0.22] - 2026-07-06

### Fixed
- Practice Mode was completely broken: clicking a date threw a TypeError (grid ids/handlers from an older design). Rebuilt on the real grid/keyboard pipeline
- Practice puzzles now use the same seed formula as the daily puzzle, so a past date replays the actual puzzle from that day
- Practice games no longer pollute daily stats or lock out today's puzzle (`updateStats`/`reportToGameShelf` are daily-only now)
- Mid-game reload: completed words lost their revealed letters and all word-score chips disappeared. Save/restore now captures every visible letter and rebuilds completed rows from the answer
- Typing a letter while the menu/intro/practice modal was open triggered a hidden +1 global reveal behind the modal
- Slate's own service worker now registers (`./sw.js`); previously the site-wide root `/sw.js` was registered instead
- Cloud-sync merge destroyed a perfect (0) best score (`bestScore || 999` treated 0 as missing)
- Win+lose race: completing the 8th word at exactly the point limit fired both end screens; a point-limit loss could auto-"complete" the revealed answers into a phantom win
- Puzzle numbers unified on the 2026-01-09 launch date and made DST/timezone-safe (three conflicting launch dates before)
- Dead buttons on the already-played screen (`showStats`/`openDatePicker` didn't exist)
- Today's answers are no longer logged to the browser console

### Added
- Interchangeable-row guesses accepted: if two rows share a vowel pattern, guessing the other row's word is correct — the answers swap slots (with consistency checks against revealed letters, persisted across reloads)
- "Today's Words" solution list on the loss screen (✓/✗ per word), plus a longer pause so the revealed board is visible before the results scroll into view
- Already-played screen now shows the finished board and your real score/consonant/words banner instead of zeros and empty bars
- Persistent event line under the score banner — the last game event stays visible after the toast fades
- Per-mode rating scales: Easy's bands are far tighter (Master ≤2) than Hard's (Master ≤8); score-range footer is generated per mode
- Difficulty analyzer rates the mode being played (Hard ignores cascade/overlap factors that only help Easy)
- End screen breaks down the consonant score into reveals + penalties

### Changed
- Removed 11 proper nouns from the answer list (APRIL, BILLY, CALIF, HENRY, JAPAN, JONES, LEWIS, MARIA, SWISS, TERRA, TEXAS) — 774 answers remain; guess dictionary unchanged. Note: this reshuffles the daily word schedule from this release forward
- Score banner label "Consonants Used" → "Consonant Score" (matches the tutorial's terminology)
- Word-score chips use a legible monospace numeral on a chip background instead of marker-font digits
- Tutorial steps reset scroll position and show a scroll hint when content overflows
- Practice end screen offers "Play Another Past Puzzle"
- sw.js CACHE_VERSION bumped to v1.0.22

---

## [1.0.21] - 2026-02-10

### Fixed
- End-game results screen crash for players with pre-existing localStorage stats from older versions (missing `ratingDistribution` property)
- `getStats()` now merges stored data with defaults so new properties are always present

---

## [1.0.19] - 2026-02-10

### Added
- VALID_WORDS dictionary (6,014 five-letter English words from American English dictionary)
- Word validation on guess: invalid words rejected with amber flash and no penalty
- Puzzle difficulty analyzer (`analyzePuzzleDifficulty`) scoring 5 factors: unique consonants, vowel pattern ambiguity, consonant overlap, cascade potential, keyboard cost
- Difficulty rating display (1–5 stars: Easy/Moderate/Tricky/Hard/Brutal) on end-game screen
- Difficulty rating on already-played return visit screen
- Difficulty line in share text (e.g., "🧩 ⭐⭐⭐⭐ Hard")

### Changed
- Wrong guess validation now uses VALID_WORDS Set instead of WORD_DATABASE array
- Share text format updated to include difficulty line
- sw.js CACHE_VERSION bumped to v1.0.19

### Fixed
- N/A

---

## [1.0.18] - 2026-02-10

### Added
- Initial deployment package with PWA support

### Changed
- N/A

### Fixed
- N/A

---

## [1.0.0] - 2026-01-XX

### Added
- Initial release: 8×5 word puzzle grid with chalkboard theme
- 785-word curated database
- Easy and Hard modes
- 50-point limit scoring system
- Statistics, streaks, share results
- Practice mode
- PWA support
- Game Shelf Integration
