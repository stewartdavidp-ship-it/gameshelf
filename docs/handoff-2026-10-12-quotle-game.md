# Handoff — Quotle game: play order + "popular mix-up" note

**Date:** 2026-10-12 · **Repo:** gameshelf (`quotle/index.html`, `quotle/sw.js`) · **Live:** https://gameshelf.co/quotle/ (GitHub Pages, merge to main deploys in ~1 min)

The quotle.info site has its own handoff, separate from this one: `docs/handoff-2026-10-12-claude-md-corpus-constraint.md` in the quotle-info repo, on the branch of [quotle-info PR #1136](https://github.com/stewartdavidp-ship-it/quotle-info/pull/1136) (still open, needs merging). Read both.

## Goal

A player reported "all the puzzles this week were presidents." Fix the play order so themed batches don't run back to back. Then (David's follow-up idea): when a puzzle's quote is one people commonly credit to the wrong person, say so in the game.

## Done and verified (both merged and live)

1. **v1.5.7, [PR #40](https://github.com/stewartdavidp-ship-it/gameshelf/pull/40): spread-out schedule.** Cause: the daily quote was `quotes[day % length]`, i.e. file order. Quotes get added in themed batches, so Oct 5–11 were 7 presidents in a row, with 1 more Bush and 5 Obamas next.
   - Days before 2026-10-12 keep the old rule exactly. Checked: 0 of 259 past dates changed, in NY, LA, London, Tokyo and Sydney.
   - From 2026-10-12, a spread order: categories paced by size, authors paced within a category, and no author again within 14 days. Each later pass is seeded from the end of the previous one.
   - Measured over ~1,000 future days: longest run of Speech quotes is 1 (was 14), at most 2 presidents in any 7 days (was 7), and at least 13 days between repeats of the same author.
   - **Verified live today:** the 2026-10-12 puzzle is #467 Marcus Aurelius (as planned); 2026-10-11 is still #382.
2. **v1.5.8, [PR #41](https://github.com/stewartdavidp-ship-it/gameshelf/pull/41): "Popular mix-up!" pop-up.** If the guess is the person this quote is commonly misattributed to, a pop-up says so, gives one clue (the real author's era), and the guess doesn't use a try. The after-game story also shows quotle.info's fact-check (268 of 310 puzzles have one). 20 puzzles trigger the pop-up today.
   - Tested in a real browser at phone size in dark mode: Aristotle on #173 showed the pop-up and left 4 tries, then Durant won with 3 left. On #433, Mahatma Gandhi was free and Socrates still cost a try.

## In progress

Nothing is half-done. No open branches apart from this doc's.

## Next steps (none urgent)

- **Deferred by David on 2026-10-11:** add a structured "often credited to" list to quotle.info records. Do it during the NEXT quotle.info work session, not as a separate project. Then switch the game's `quoteMixupNames()` to read that list instead of parsing free-text tags. Sizing, the rule to copy (`tools/mis-kind.js` + `backfill-mis-kind.js`), and the traps are in memory [[quotle-game-misquote-overlay]].
- Nice to have: on wrap-around seams, the same author can come back after 13 days instead of 14 (Marcus Aurelius has 10 quotes). It's acceptable; leave it unless someone notices.

## Decisions and why

- **Past days are frozen** (`legacyQuoteIndex`, including its daylight-saving off-by-one), so practice-mode history and saved results don't move.
- **Cutover position pinned (`SPREAD_FROM_POSITION = 258`), not computed.** The old day count already differed by a day between hemispheres, so pinning it gives everyone the same schedule from now on.
- **Mix-up timing:** David chose "pop up on that wrong guess" over "after the game only" or "a badge before guessing". The guess is free because the pop-up uses up its feedback.
- **Mix-up names come from quotle.info at runtime** (record `misattribution.items[].who`, matched to the game's author list). There's no copied list in the game, so the research has one home. Items that describe a related idea or an older precursor are skipped, because calling those a mix-up would be wrong (e.g. Jobs/Confucius).

## Open questions for David

- Has the reply gone to the person who reported the presidents issue? Two drafts were given in the session (a long one and a short one).

## Gotchas hit

- **Verified-quote trap:** `quotes = allQuotes.filter(q => q.verified)`. Marking an early quote verified shifts every past day and moves position 258. Add new quotes at the END. (Memory: [[quotle-game-play-order]].)
- `#author-select` is a hidden `<input>`, not a `<select>`. A test that sets it to a name outside the author list crashes `submitGuess` (`guessedQuote` is undefined). Real players can't do that; it only affects test scripts.
- The welcome overlay ("I know the rules") isn't a `.modal`. Clear it with its button or it eats clicks.
- `gh pr merge` prints "'main' is already used by worktree" when run from a worktree, but the merge still succeeds on GitHub. Check with `gh pr view N --json state`.
- Preview servers come from `~/Developer/.claude/launch.json` (shared). I added temporary entries and removed them; there's also an existing `gameshelf` entry on port 8788.
- Verify the schedule with a node harness that slices `allQuotes` plus the scheduling functions out of `index.html` and runs them under several `TZ=` values. The game has no test suite.
