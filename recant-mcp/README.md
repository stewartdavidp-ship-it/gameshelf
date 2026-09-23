# Recant — MCP server

Today's Recant case, playable by talking instead of tapping.

Six people were in the building. One of them is lying about where they were. You
get two challenges: put two people's stories to each other and see who gives way. An
honest witness who simply misremembered corrects themselves and that thread
closes. The liar recants, and a new conflict opens. Corner them and you have
**proved** it; name them without that and you only **guessed**.

The web version is at [gameshelf.co/recant](https://gameshelf.co/recant). This is
the same case, same day, same answer — the engines are checked against each other
by `npm test`.

## Install

```bash
npm install
```

Then add it to your MCP client. Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "recant": {
      "command": "node",
      "args": ["/Users/davidstewart/Developer/gameshelf/recant-mcp/server.mjs"]
    }
  }
}
```

Claude Code:

```bash
claude mcp add recant -- node /Users/davidstewart/Developer/gameshelf/recant-mcp/server.mjs
```

Then just say **"open today's case"**.

## Tools

| tool | costs | what it does |
|---|---|---|
| `open_case` | — | Opens today's case, or resumes it. `practice: true` for a random one that doesn't save. |
| `ask_witness` | free | Their movements, who they saw, what they say about someone else, or the incident. Ask as much as you like. |
| `confront` | **1 challenge** | Put one account to another. If the two don't actually clash, the challenge is wasted. |
| `case_file` | free | Where every account currently stands and how many challenges are left. |
| `accuse` | ends it | Name them. Full debrief, including what the honest mistakes were and the route through. |

## Why it is built this way

**This process owns the truth and decides every outcome.** The model on the other
end never learns who did it, never learns the chain of alibis, and never decides
whether a confrontation landed. It maps what the player said onto a tool call and
speaks the result back.

That split is not fussiness, it is the measured difference between the games in
this genre that work and the ones that don't. Where the model owns the facts,
witnesses invent corroborating strangers who don't exist, confess without being
caught, and reverse themselves under mild pressure — and once invention is
indistinguishable from deceit, no contradiction means anything and the genre stops
working. Here the model cannot leak what it was never given.

There is one honest asymmetry with the web version. In a browser the interface is
neutral. Here the narrator is the player's own assistant, and it will try to help
them — it can reason about the case, and if it reads every account it may well
spot the honest mix-up for you. It cannot *know*, though: nothing in any tool
result contains the answer until the accusation. Treat it as a partner who talks
too much rather than a referee.

## Tests

```bash
npm test
```

Three groups:

1. **Parity.** The web game carries its own inline copy of the engine, because a
   Game Shelf game is one self-contained file. The test extracts that copy, runs
   both over 1,500 seeds and compares the whole case object. If they drift, the
   phone and the chat version would disagree about who did it and nothing else
   would tell you. *(Verified to fail on a one-word change to either copy —
   don't trust a gate that has never gone red.)*
2. **Invariants.** 2,000 daily keys all produce a case; the culprit is never the
   only lead on the opening board; every alibi has a breaker who was genuinely
   alone in that room.
2b. **The decision.** Asking must leave two rooms that look identical — one hiding
   the liar, one an honest witness with the time wrong — and the clue between them
   (the mix-up's own timeline shows the same room twice) must never point at the
   wrong person. Pinned as outcomes: reading the accounts proves 100%, asking and
   guessing ~50%, never asking ~16%. Verified to fail with either guard removed
   (guessing jumps to 92%; reading drops to 70%).
3. **End to end** over real MCP stdio: a wasted challenge costs one, the chain
   corners the liar, the case closes after an accusation — and **no result leaks
   the answer before the accusation**.
