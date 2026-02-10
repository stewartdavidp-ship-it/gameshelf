# Slate — CHANGELOG.md

All notable changes to Slate are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

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
