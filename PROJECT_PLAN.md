# Game Shelf v1.11.0 Project Plan
## Dynamic Home Grid & Favorite Games

**Document Version:** 1.0  
**Release Version:** 1.11.0  
**Date:** February 9, 2026  
**Previous Version:** 1.10.1

---

## Executive Summary

Version 1.11.0 replaces the hard-coded 6-tile home screen with a dynamic grid that adapts to the user's shelf size, and adds a favorite games system for users with 10+ games.

### Key Achievements

1. **Dynamic Home Grid** — Auto-sizes from 1 to 3 rows based on shelf count
2. **Compact Card Mode** — Smaller cards at 7+ tiles keep the grid readable
3. **Favorite Games** — Heart toggle on Games tab for 10+ game users to curate home screen

---

## Issues Addressed

| ID | Issue | Resolution |
|----|-------|------------|
| Home tile limit | Hard-coded to 6 tiles regardless of shelf size | Dynamic: show all up to 9 |
| No customization | Users couldn't choose which games appear on home | Heart favorites for 10+ games |
| Wasted space | Users with 1-3 games had empty grid slots | Grid rows match game count |

---

## Solution Design

### Design Decision: Auto-Size Over Settings

**Rejected:** Settings dropdown to choose 3/6/9 tiles  
**Chosen:** Automatic sizing based on shelf count

**Rationale:** Simpler UX — no configuration needed for most users. The grid just works.

### Tier System

| Shelf Size | Home Tiles | Card Style | Favorites? |
|-----------|-----------|-----------|-----------|
| 1-3 | All (1 row) | Standard | No |
| 4-6 | All (2 rows) | Standard | No |
| 7-9 | All (3 rows) | Compact | No |
| 10+ | Top 9 (3 rows) | Compact | Yes — hearts shown |

### Favorite Games UX

- Heart icon (🤍/❤️) in bottom-right corner of each game card on Games tab
- Only visible when shelf has 10+ games (otherwise unnecessary)
- Tap toggles favorite on/off with toast feedback
- Max 9 favorites enforced with warning toast
- `event.stopPropagation()` prevents card click-through

---

## Implementation Details

### Change #1: CSS — Compact Grid & Heart Icons

**New CSS classes:**
- `.games-grid.compact` — reduces padding, icon size, font sizes
- `.game-fav-heart` — positioned bottom-right, opacity-based visibility
- `.game-fav-heart.favorited` — full opacity with red heart

**Compact reductions:**
- Card padding: 14px 10px → 10px 6px
- Icon: 1.5rem → 1.25rem
- Name: 0.72rem → 0.65rem
- Status: 0.7rem → 0.62rem
- Done checkmark: 18px → 15px

### Change #2: Helper Functions

```javascript
getFavoriteGames()        // Returns favorites array
isGameFavorited(gameId)   // Boolean check
toggleFavoriteGame(id, e) // Add/remove with max enforcement
getHomeGames()            // Dynamic game list for home display
```

### Change #3: renderHomeGames()

- Uses `getHomeGames()` instead of `appData.games.slice(0, 6)`
- Applies `.compact` class when `shelf.length >= 7`
- "+X more" badge adapts to actual overflow count

### Change #4: renderShelfGames()

- Adds heart HTML to each card when `appData.games.length >= 10`
- Heart calls `toggleFavoriteGame()` with `event.stopPropagation()`

### Change #5: renderQuickGames()

- Uses `getHomeGames()` instead of `appData.games.slice(0, 6)`

---

## Data Model

```javascript
appData.settings.favoriteGames = ['wordle', 'connections', 'strands', ...]
// Array of game ID strings, max length 9
// Empty array = no favorites set
// Syncs via existing Firebase settings object
```

---

## Testing Plan

| Test Case | Steps | Expected |
|-----------|-------|----------|
| 1-3 games | Add 2 games to shelf | 1 row, standard cards, no hearts |
| 4-6 games | Add 5 games to shelf | 2 rows, standard cards, no hearts |
| 7-9 games | Add 8 games to shelf | 3 rows, compact cards, no hearts |
| 10+ games | Add 11 games to shelf | 3 rows compact, hearts visible on Games tab |
| Favorite toggle | Tap heart on Games tab | Heart fills red, toast confirms, home updates |
| Max favorites | Favorite 9 games, try 10th | Warning toast, 10th not added |
| Unfavorite | Tap filled heart | Heart empties, home grid updates |
| Auto-fill | 12 games, 5 favorites | Home shows 5 favs + 4 from shelf order |
| Quick games | Any shelf size | Quick bar matches home grid games |
| Cloud sync | Sign in on second device | Favorites array syncs via settings |

---

## Future Considerations

- Favorites could inform: share text priority, friend recommendations, morning review focus
- Drag-to-reorder favorites for custom home grid ordering
- "Pin to top" as alternative UX metaphor
- Per-game home screen widgets (stats preview in card)
