# Slate — PROJECT_PLAN.md

> Roadmap, completed work, design decisions, and pending items.

---

## Completed Features

### v1.0.0 — Initial Release
- [x] 8×5 grid with vowel-revealed, consonant-hidden word puzzle
- [x] 785-word curated database of five-letter words
- [x] Deterministic daily puzzle generation (date-seeded)
- [x] Keyboard consonant reveal (+1 cost per letter)
- [x] Per-square free guessing (tap square, type letter)
- [x] Word completion detection and scoring
- [x] Easy mode (auto-reveal consonants in other rows on word complete, cascading)
- [x] Hard mode (no auto-reveal)
- [x] 50-point limit scoring system (lower = better)
- [x] Score ratings: Perfect (0), Master (1-8), Expert (9-16), etc.
- [x] Chalkboard visual theme with chalk-dust particle effects
- [x] Tutorial/How to Play modal
- [x] Statistics tracking (games played, win rate, streaks, score distribution)
- [x] Share results with emoji grid
- [x] Practice mode (random non-daily puzzles)
- [x] localStorage persistence
- [x] PWA support (sw.js, manifest.json, icons)
- [x] Game Shelf Integration (cloud sync, cross-app reporting)
- [x] Mobile-responsive design

### v1.0.18 — Prior Session
- [x] Various bug fixes and refinements

### v1.0.19 — Word Validation & Difficulty Rating
- [x] VALID_WORDS dictionary (6,014 five-letter English words) for guess validation
- [x] Invalid word rejection: amber flash + "Not a valid word — no penalty!" toast
- [x] Valid wrong word: red flash + penalty (existing behavior preserved)
- [x] Puzzle difficulty analyzer (`analyzePuzzleDifficulty`) with 5-factor scoring
- [x] Difficulty rating display on end-game screen (1–5 stars)
- [x] Difficulty rating in share text
- [x] Difficulty shown on already-played return visit screen
- [x] sw.js version sync to v1.0.19

---

## In Progress

*Nothing currently in progress.*

---

## Planned / Backlog

### Near Term
- [ ] **Puzzle difficulty gate** — If data shows too-easy puzzles occurring, add minimum difficulty threshold to `getDailyWords()` that rerolls seed until puzzle meets minimum score
- [ ] **Difficulty calibration** — Collect player data on difficulty ratings vs actual scores to tune the 5-factor formula weights

### Medium Term
- [ ] **Sound effects** — Chalk writing sounds, eraser sounds, completion fanfare
- [ ] **Animations** — Letter reveal animations, cascade visual effects in Easy mode
- [ ] **Streak calendar** — Visual calendar showing play history and streaks
- [ ] **Personal best tracking** — Track best scores per difficulty level

### Long Term
- [ ] **Expanded word database** — Add more curated puzzle words beyond 785
- [ ] **Themed puzzle packs** — Special category puzzles (science words, geography, etc.)
- [ ] **Multiplayer/Battle mode** — Head-to-head Slate via Game Shelf battle system

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Two-list word architecture | 785 puzzle words + 6,014 valid guesses | Keeps puzzle quality curated while allowing fair validation |
| Dictionary source | American English system dictionary | Broad coverage, no licensing issues, includes common words |
| Invalid guess = no penalty | Amber flash, clear, no score impact | Penalizing typos/obscure words feels unfair; only real wrong guesses cost |
| Difficulty scoring | 5-factor weighted formula | Captures consonant complexity, ambiguity, cascade potential, and keyboard cost |
| No difficulty gate (yet) | Let random generation run freely | Sampling showed 82% of puzzles are Hard/Brutal naturally; gate not needed yet |
| Deterministic seeding | `parseInt(YYYYMMDD) * 377 + 12345` | Ensures all players get same daily puzzle |
| 50-point limit | Game over if score exceeds 50 | Prevents aimless consonant clicking; rewards strategic play |
