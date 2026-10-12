# Handoff — Game Shelf growth basics, Parity, Word Boxing guest play (2026-10-12)

This hands over the laptop session that ran 2026-09-23 → 2026-10-05: Parity levels, the
Recant shutdown, and the "why does nobody use gameshelf.co" work. The Quotle game work is
covered separately in `handoff-2026-10-12-quotle-game.md`.

## Goal

Get gameshelf.co in front of people who aren't friends and family. Order:
1. Make usage measurable.
2. Remove anything that stands between a stranger and playing.
3. Then launch one game to strangers and see whether they come back.

Steps 1 and 2 are done; step 3 has not started.

## Done and verified

Each item was verified live on gameshelf.co unless it says otherwise.

| What | Where | Verified |
|---|---|---|
| Parity 1.1.0: Starter level (3→8-move ladder), the level is remembered, nudges up to Easy/Hard | a270331 | live, real UI |
| GA tag on every page (home + all 5 games); before this only `/app/` was tagged | #37 | live HTML has the tag; the first per-page numbers are below |
| Home-page hero + AI screenshots restored (deleted by mistake in a Feb 9 "stale file" cleanup; the hero was broken live for 8 months) | #37 | 200 live |
| Contact matching removed (the finder UI was already unreachable; sign-in still published a hash of each user's email to `contact-hashes`) | #37 | locally, no console errors |
| App v1.17.0: menu cut from 20+ items to 6: change my games, theme, send feedback (mailto), check for updates, reset all data, legal. Also fixed: a dead FAQ link, a stale "v1.12.0" footer, and a double-Cancel confirm | #38 | live |
| RTDB `/users` locked to its owner (it was readable by ANY signed-in user, which exposed 12 emails) | Firebase console/REST, not in git | live: own record readable, another player's gives PERMISSION_DENIED |
| Word Boxing 1.0.28: online play asks for a nickname and signs in as an anonymous guest instead of requiring Google | #39 | live: guest created, game created and canceled |
| Recant: abandoned and delisted, kept as an archive | earlier | — |

**First week of per-page numbers (GA, Oct 5–11):** 24 users and 102 views in total.
- `/quotle/`: 16 users, but a 13-second average. Most likely quotle.info visitors who bounce.
- `/` (home): 6 users.
- `/app/`: about 4 users. That figure is probably the operator.
- `/slate/`: 2 users at 6m45s; real plays, probably the operator too.
- `/wordboxing/`: 1 user.
- **Parity and Rungs: zero.**

## In progress / exact next step

Nothing is mid-flight; every change is merged.

The next step is the growth plan's step 3. The operator has **not** approved it yet, so confirm before starting:
- **Lead with one game, not the shelf.** Parity was the candidate.
- **Review its share text** so a stranger who sees it wants to tap.
- **Launch in one free place at a time and measure each:** Show HN, the Reddit web-game and daily-puzzle communities, an itch.io listing.

Do one small test first: have a stranger play cold and see whether they come back the next day (see memory `game-design-learnability-first`).

**Quotle bounce:** 16 users landed in a week with a 13-second average. That's the biggest visible leak, so it may be a better first target than launching Parity. Whoever owns the Quotle work should look at what those visitors see first.

## Decisions and why

- **Sign-in stays, but is never offered.** Login's only real value is cross-device sync. The social features it unlocked (friends, purchases, battles) had no users besides the operator. Operator: "don't need anything that is login required."
- **Word Boxing guests use Firebase anonymous auth**, not a custom identity. It's the simplest way to satisfy the existing `auth != null` rules. The same device keeps the same guest and rating.
- **Anonymous auto clean-up is OFF.** It would delete guests after 30 days and wipe their rating.
- **The nickname box is the browser's own `prompt()`.** The operator asked to "simplify whenever possible". Replace it if it looks too plain.
- **"Simplify whenever possible"** is a standing instruction from the operator for this work.

## Open questions for the operator

1. A test guest named **"Claude test"** sits in `/users` and `/leaderboard` (uid `vOVCU0bCTvgxq9ze5O6xpJVYhSa2`). Delete it, or leave it?
2. **Parked branch `quotle-hint-rewrites-parked`** (pushed, not merged): five Quotle hint rewrites found uncommitted in an abandoned July worktree. Each old hint gave the author away; the new ones don't. It needs review and a rebase onto current main, or it can be dropped.
3. Approve step 3, launching a game to strangers, and choose the game. Parity was the recommendation; the Quotle bounce suggests looking there first.
4. The home page still pitches the old idea (tracking, AI hints, battles, friends). That's out of step with the discovery pivot and the stripped-down app. Should it be rewritten?

## Gotchas

- **The `word-boxing` Firebase project is shared.** It also holds Mast-era data (shirglassworks, command-center, mast-platform rules). Claude Code's safety check blocks changes to it, even writing a proposed rules file to disk. The operator either makes the change in the console or explicitly OKs it in chat. Enabling a sign-in provider was blocked even after rule changes were OK'd.
- **Rules backups** (before and after the `/users` change): `~/Downloads/gameshelf-rules-backup-2026-10-05/` on the laptop.
- **GA:** property `519142330`, readable only through logged-in Chrome; the gcloud token lacks the analytics scope. Chrome opens GA on an empty "labelkeeper" property by default; search `G-XRL2SVN0YF` to find the right one.
- **Every release bumps the version** in the page *and* in that game's `sw.js` CACHE_VERSION, or installed home-screen copies never update. See memory `pwa-updates-gameshelf`.
- **Removing elements from the app:** check every element id the JS reads. They were all null-safe this time, but a past cleanup shipped a ReferenceError.
- **The main checkout is shared.** Other sessions push Quotle work to main, so use `git worktree add` for changes and merge PRs yourself (`gh api -X PUT .../pulls/N/merge`, because `gh pr merge` fails when main is checked out elsewhere).
- **`zsh` globbing:** quote URLs containing `?` in curl, or the command dies with "no matches found".

## Memory notes to read

`gameshelf-usage-and-analytics` (numbers, GA access, what shipped) · `parity-game-shelf` ·
`wordboxing-state` · `pwa-updates-gameshelf` · `gameshelf-discovery-pivot` ·
`game-design-learnability-first` · `recant-game-state` (do not revive) · `location-puzzle-race`
(a separate exploration: nothing built, waiting on the operator).
