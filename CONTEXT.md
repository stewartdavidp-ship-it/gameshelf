# Slate — CONTEXT.md

> **Read this first** at the start of every session.

## Current Version

**v1.0.20**

## What Slate Is

A daily word puzzle game with a chalkboard theme. Players are shown an 8×5 grid where 8 five-letter words have their vowels revealed but consonants hidden. Players deduce words by revealing consonants (via keyboard or per-square guessing), with a scoring system that rewards efficiency — fewer consonants used = better score.

Built for puzzle enthusiasts who enjoy word deduction games like Wordle and Connections.

## Architecture

- **Single-file HTML app**: All CSS/JS inline in index.html (~233 KB)
- **Framework**: Vanilla JavaScript
- **Styling**: Custom CSS (inline), chalkboard aesthetic with chalk-dust effects
- **Data**: localStorage for game state, stats, streaks
- **PWA**: Yes — sw.js + manifest.json + icons/
- **Cloud Sync**: Game Shelf Integration module for Firebase sync

## Key Technical Details

### Meta Tags
```html
<meta name="version" content="1.0.19">
<meta name="gs-app-id" content="slate">
```

### Game Mechanics
- **Grid**: 8 rows × 5 columns, each row is a 5-letter word
- **Vowels**: Always revealed (free)
- **Consonants**: Hidden, revealed via keyboard (+1 cost) or per-square guess (free)
- **Wrong word guess**: +1 penalty if valid English word, no penalty if not a real word
- **Scoring**: Sum of consonant count at time each word is completed. Lower = better.
- **Point Limit**: 50 points — exceeding = game over (DNF)
- **Modes**: Easy (completing a word auto-reveals its consonants in other rows, cascading) and Hard (no auto-reveal)

### Word Database
- **WORD_DATABASE**: 785 curated five-letter words used as daily puzzle answers
- **VALID_WORDS**: 6,014 five-letter English words (American English dictionary) used for guess validation
- Puzzle words are a subset of valid words — all puzzle words are valid guesses

### Puzzle Generation
- Deterministic daily seed from date: `parseInt(YYYYMMDD) * 377 + 12345`
- Seeded shuffle of WORD_DATABASE, first 8 words selected
- Same puzzle for all players on same day

### Difficulty Rating System
- `analyzePuzzleDifficulty(words)` scores each puzzle on 5 factors:
  - Unique consonants needed (8–16 range)
  - Vowel pattern ambiguity (how many DB words share same vowel pattern)
  - Consonant overlap between word pairs (more overlap = easier cascades)
  - Max cascade from single word solve (Easy mode)
  - Minimum keyboard consonants to solve (greedy simulation)
- Returns 1–5 stars: Easy, Moderate, Tricky, Hard, Brutal
- Displayed on end-game screen and included in share text

### Share Text Format
```
🪨 Slate #33 ✅
🟩🟩🟩🟩🟩🟩🟩🟩
Score: 12 🌟
🟢 Easy
🧩 ⭐⭐⭐⭐ Hard
slate.game
```

### Version Locations (5 places)
1. `<meta name="version" content="X.X.X">`
2. `const APP_VERSION = 'X.X.X'`
3. Tutorial/About display
4. Footer version badge
5. `sw.js` → `const CACHE_VERSION = 'vX.X.X'`

## Deployment

- **Production**: https://gameshelf.co/slate
- **Test**: https://stewartdavidp-ship-it.github.io/gameshelftest/slate/
- **Repo**: Consolidated gameshelf repo, subpath `slate/`

## Conventions

- All code in single index.html file
- Chalkboard dark theme (#2a3a2a background, chalk-white text, #f4e4c1 gold accents)
- Mobile-first responsive design
- Game Shelf Integration module at bottom of file for cross-app reporting
