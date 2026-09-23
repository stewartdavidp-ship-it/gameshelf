# The nightly catalog agent — build spec

**Status: designed, not built.** Written 2026-09-23 after a 10-game test whose findings are baked into this design. Read the findings before building; three of them invert the obvious approach.

---

## 1. What this is for

Game Shelf is pivoting from tracking-and-sharing to **discovery**. Opening the app should tell you: how many games exist, how many are new since you were last here, how many are on your shelf. That only works if the catalog grows without a deploy.

The nightly agent is what makes it grow.

---

## 2. What already exists (done)

| | |
|---|---|
| `app/catalog.json` | 42 games. The app fetches it at boot and merges over the built-in `GAMES` object, which remains the offline fallback. |
| `app/catalog-quarantine.json` | Candidates that failed a gate. Currently 1 (Pilfer). |
| `loadCatalog()` in `app/index.html` | Fetches, validates `id`+`name`+`url`, merges, and slots each game into its browse category by name. Not awaited — a slow catalog never delays startup. |
| `catalogStats()` | Returns `{total, onShelf, newSinceLastVisit, lastVisit}`. |
| `markVisited()` | Writes `gameshelf_last_visit`. |

Nothing reads `minutes`, and no UI surfaces the counts yet — that's the discovery screen, a separate piece of work.

---

## 3. Findings that constrain the design

These came from the 10-game test (`~/Downloads/gameshelf-catalog-agent-test-2026-09-23/`). **Do not design around the obvious approach; it was measured and it fails.**

**3.1 A game's own homepage is a bad source. 1 complete entry in 10.**
Three of eleven URLs could not be fetched at all — `nytimes.com`, `puzzmo.com` (both block bots) and `squardle.com` (TLS failure). Two more were JavaScript shells that yielded a name and nothing else. Marketing pages rarely describe the mechanic.

**3.2 A directory page gave 12 usable candidates in one fetch.**
`puzzle-index.com/games-like-wordle` returned name, url, description, cadence and category for all 12. Seven were already in the catalog. Five were new and legitimate.

**3.3 But the directory's descriptions were WRONG for three of five checked.**
- The Loop — directory: *"create word chains by looping letters into valid words"*. Britannica: **"a daily picture puzzle game"**.
- Blossom — directory: *"build high-scoring words from a fixed set of letters"*. Merriam-Webster: **"Can you solve 4 words at once?"**
- The Missing Letter — directory's description was misleading about the mechanic.

**So: the directory is a source of CANDIDATES. The publisher page is the source of FACTS.** A pipeline that trusts directory summaries would have published three wrong descriptions on day one, into the exact feature meant to help people choose what to play.

**3.4 `minutes` is unobtainable.** 1 of 11 from homepages, 0 of 12 from the directory. Games do not advertise how long they take. It must not be a required field.

**3.5 A 403 is not a dead link.** `britannica.com/games/loop` returns 403 to `curl` and renders perfectly in a browser. A naive link check would discard the most notable publishers first.

**3.6 A candidate URL may be a publisher, not a game.** `capitalle.app` returned eight games from one URL.

---

## 4. Architecture

```
GitHub Action (cron, nightly)
  → fetch allowlisted directory pages        ← candidates only
  → drop anything already in the catalog     ← the majority case
  → for each survivor: fetch the publisher page
  → extract facts with the Claude API        ← publisher page is the source of truth
  → run the gates
  → write app/catalog.json + app/catalog-quarantine.json
  → commit directly to main
  → GitHub Pages deploys; the app picks it up on next load
```

Auto-merge, no human gate — the operator's decision. **All quality control therefore lives in the gates**, because nothing stands between the agent and players.

---

## 5. Schema

```jsonc
{
  "id":          "missing-letter",          // slug, stable, never reused
  "name":        "The Missing Letter",
  "icon":        "🔤",                       // emoji; presentation only
  "url":         "https://…",
  "publisher":   "Merriam-Webster",
  "hasApp":      false,
  "category":    "Word Games",              // MUST match a GAME_CATEGORIES name
  "description": "A daily crossword whose clues are…",
  "cadence":     "daily",                   // daily | endless | multiplayer
  "minutes":     null,                      // OPTIONAL — see 3.4
  "platform":    "browser",
  "addedAt":     "2026-09-23T12:16:16Z",    // null on seeds, so seeds are never "new"
  "source":      "puzzle-index.com, description verified against publisher page"
}
```

**Required:** `id`, `name`, `url`, `category`, `description`, `cadence`.
**Optional:** `minutes`, `icon`, `publisher`, `hasApp`, `platform`.

`category` must be one of the existing `GAME_CATEGORIES` names or the game will be invisible in browse: `NYT Games`, `Game Shelf Originals`, `LinkedIn Games`, `Word Games`, `Geography`, `Entertainment`, `Sports & Misc`.

---

## 6. The gates

Every gate is a precondition for publishing. Failing any one sends the candidate to quarantine with a reason — never silently dropped, so you can see what it rejected.

| # | Gate | Pass | Quarantine | Notes |
|---|---|---|---|---|
| 1 | **Duplicate** | url not in catalog AND normalised name not in catalog | either matches | Normalise: lowercase, strip non-alphanumeric. The majority case — 7 of 12. |
| 2 | **Link resolves** | 2xx | 404, 410, DNS failure, TLS failure | |
| 3 | **Bot-blocked** | — | 403, 429, 999 | **Do not treat as dead.** Quarantine as `unverified-blocked` — these are often the best publishers (3.5). |
| 4 | **One game, not a suite** | page describes a single game | describes several | Ask the extractor explicitly; `capitalle.app` returned 8 (3.6). |
| 5 | **Schema complete** | all required fields non-null | any missing | `minutes` exempt. |
| 6 | **Source allowlisted** | directory on the allowlist | anything else | No open crawling. |

Allowlist to start: `puzzle-index.com`. Add others only after checking their accuracy against publishers, given 3.3.

---

## 7. Quarantine format

```jsonc
{
  "generatedAt": "2026-09-23",
  "note": "Candidates that failed a gate. Nothing here has been published.",
  "entries": [{
    "name": "Pilfer",
    "url": "https://www.merriam-webster.com/games/pilfer",
    "publisher": "Merriam-Webster",
    "foundVia": "puzzle-index.com",
    "failedGate": "description and cadence unverifiable",
    "detail": "Publisher page says only 'a delightfully ruthless word game'…",
    "checkedAt": "2026-09-23T12:16:16Z"
  }]
}
```

Quarantine is append-and-dedupe: don't re-check the same failing URL every night forever. Re-check `unverified-blocked` entries weekly (a 403 may lift); leave `no-mechanism-stated` alone until a human looks.

---

## 8. The extraction call

One call per surviving candidate, against the **publisher page text**, not the directory.

- Model: **`claude-opus-5`**. Volume is a handful of pages a night, so cost is not a reason to downgrade. If you later want a cheaper bulk path, `claude-haiku-4-5` is the current cheap model — that's a deliberate choice, not a default.
- Use **structured outputs**: `output_config: { format: {...} }` with the schema from §5. Do **not** use the deprecated `output_format` parameter, and do not prefill the assistant turn (removed on current models — returns 400).
- `output_config: { effort: "low" }` is appropriate; this is extraction, not reasoning.
- Node SDK `@anthropic-ai/sdk` (the repo is JS). Key from `ANTHROPIC_API_KEY` in Action secrets.

**The prompt must forbid guessing.** The single most valuable line, proven by the test:

> Use only what this page states or directly shows. If the page does not state a field, return null for it. Do not infer from general knowledge about the game. Also return `isSingleGame: false` if the page describes more than one game.

Returning `null` is a *success* — it routes to quarantine instead of publishing a fabrication.

---

## 9. The GitHub Action

```yaml
name: catalog
on:
  schedule:    [{ cron: "0 6 * * *" }]   # 06:00 UTC nightly
  workflow_dispatch:                      # manual run for testing
permissions:
  contents: write                         # needed to commit
```

- Runs `node scripts/catalog-agent.mjs`.
- Commits `app/catalog.json` + `app/catalog-quarantine.json` **only if changed**, message: `catalog: +N games (M quarantined)`.
- Also bump `app/sw.js` `CACHE_VERSION`? **No** — the app fetches `catalog.json` with `cache: 'no-cache'` and the service worker is network-first for the page, so a catalog change reaches users without a version bump.
- Write a run log to `docs/catalog-runs/YYYY-MM-DD.json` so a bad night is diagnosable after the fact.

---

## 10. Failure modes and what to do

| Failure | Handling |
|---|---|
| Directory page is down | Exit 0, change nothing. A missed night is not an incident. |
| Directory returns garbage / redesigned | Cap additions per run (**suggest 10**). If exceeded, quarantine the excess and log loudly — a redesign that breaks parsing looks like a flood of candidates. |
| API key missing or API errors | Exit non-zero so the Action shows red. Do not commit a partial catalog. |
| Publisher page blocked | Gate 3 — quarantine as `unverified-blocked`, retry weekly. |
| Same junk candidate every night | Quarantine dedupe by URL. |
| A published game later dies | Not covered by this design. See §12. |

---

## 11. Testing before enabling the cron

1. Run via `workflow_dispatch` with a `DRY_RUN=1` env var that writes to `/tmp` and prints a diff instead of committing.
2. Check the diff by hand against the publishers — spot-check every description against the game's own page, exactly as was done on 2026-09-23.
3. Only after two clean manual runs, enable the schedule.

Do not skip step 2 on the first real run. The whole reason this design exists is that the obvious version would have shipped three wrong descriptions.

---

## 12. Not covered — decide before or soon after launch

- **Link rot.** Nothing re-checks existing catalog entries. A separate weekly sweep should verify every `url` still resolves and quarantine the dead. Probably more valuable than adding games.
- **Removal.** There is no path to remove a published game.
- **`icon`.** The agent has to pick an emoji, or entries get a default. Currently unspecified.
- **Duplicate-by-different-URL.** The same game at two domains (mirrors, clones) passes gate 1. Name normalisation catches some; re-skins of the same game it won't.
- **Description quality.** Gates check presence, not whether the sentence is any good.
- **The discovery screen itself** — the counts, browse and keyword search that make any of this visible to a player. That's the other half of the pivot and is not specified here.
