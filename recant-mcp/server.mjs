#!/usr/bin/env node
// RECANT — MCP server.
//
// THE CONTRACT: this process owns the truth and decides every outcome. The
// client model never learns who did it, never learns the chain of alibis, and
// never decides whether a confrontation landed. It maps the player's words onto
// a tool call and speaks the result. That is the one job an LLM is reliably
// good at, and a bad mapping costs a tool call rather than a wrong verdict.
//
// This matters because the alternative is measured. Games where the model owns
// the facts produce witnesses who invent corroborating strangers, confess
// without being caught, and reverse themselves under mild pressure. Here the
// model cannot leak what it was never given.
//
// Note the asymmetry with the web version: in a browser the UI is neutral, but
// here the narrator is the player's own assistant and will try to help them.
// That is fine, and arguably the point -- it can reason, but it cannot know,
// because nothing in any tool result contains the answer until the case ends.

import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  TIMES, PRESSINGS, SCENARIOS, dailyCase, generate, conflicts, par, todayKey, dayNumber,
} from './engine.mjs';

// ---------------------------------------------------------------------------
// Session state, persisted to disk.
//
// This has to survive a process restart or there is no daily game. An MCP
// client spawns the server per conversation, so without persistence every new
// chat handed the player a fresh four pressings and the same case could be
// farmed until it fell over. Measured, not assumed: the first version reset
// 2 pressings back to 4 on reconnect.
//
// Only the mutable part is stored. The case itself is regenerated from the
// date, which is cheaper than serialising it and cannot drift from what the
// web version shows for the same day.
// ---------------------------------------------------------------------------
// RECANT_STATE_DIR lets the tests run against a throwaway directory; without
// it a previous run's saved game leaks in and the suite fails on its own state.
const STATE_DIR = process.env.RECANT_STATE_DIR || join(homedir(), '.recant');
const STATE_FILE = join(STATE_DIR, 'state.json');

let S = null;

function persist() {
  if (!S || S.practice) return;   // practice cases are throwaway
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify({
      day: S.day, chain: S.chain, label: S.label,
      claim: S.claim, stage: S.stage, left: S.left, over: S.over,
      accused: S.accused, proved: S.proved, log: S.log,
      recanted: [...S.recanted], corrected: [...S.corrected],
    }));
  } catch { /* a read-only home should not break the game */ }
}

function restore(day, chain) {
  try {
    const raw = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    if (raw.day !== day || raw.chain !== chain) return null;   // a new day is a new case
    const c = dailyCase(day, chain);
    if (!c) return null;
    return {
      c, day, chain, label: raw.label, practice: false,
      claim: raw.claim, stage: raw.stage, left: raw.left, over: raw.over,
      accused: raw.accused, proved: raw.proved, log: raw.log || [],
      asked: new Set(),
      recanted: new Set(raw.recanted || []),
      corrected: new Set(raw.corrected || []),
    };
  } catch { return null; }
}

function newSession(c, label, { day = null, chain = 3, practice = false } = {}) {
  S = {
    c, label, day, chain, practice,
    claim: c.claim.slice(),   // what each witness CURRENTLY says; recantations move this
    stage: 0,                 // how far down the chain the liar has been pushed
    left: PRESSINGS,
    over: false,
    accused: null,
    proved: false,
    log: [],
    asked: new Set(),
    recanted: new Set(),
    corrected: new Set(),
  };
  persist();
  return S;
}

const nameOf = (i) => S.c.scen.cast[i];
const place = (i) => S.c.scen.places[i];

// Fold accents before matching. A model asked to name "Sørensen" will often
// send "Sorensen", and so will anyone typing on a phone keyboard. NFD handles
// the combining-mark cases (ö, á, å); the map covers the letters NFD does not
// decompose at all, which is exactly where ø lives.
const FOLD = { 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'đ': 'd', 'ð': 'd', 'ł': 'l', 'þ': 'th' };
function fold(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[øæœßđðłþ]/g, (ch) => FOLD[ch] || ch)
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function findWitness(input) {
  if (input == null) return -1;
  const q = fold(input);
  if (!q) return -1;
  const cast = S.c.scen.cast.map(fold);
  let i = cast.indexOf(q);
  if (i >= 0) return i;
  i = cast.findIndex((n) => n.startsWith(q) && q.length >= 3);
  if (i >= 0) return i;
  i = cast.findIndex((n) => q.includes(n));
  if (i >= 0) return i;
  // last resort: the player wrote a phrase containing the name
  return cast.findIndex((n) => n.length >= 4 && fold(input).includes(n.slice(0, 4)));
}

function text(body) {
  return { content: [{ type: 'text', text: body }] };
}

function needCase() {
  if (!S) return text('No case is open. Call open_case first.');
  return null;
}

// A short standing note on every result. It is advisory -- this is the player's
// own client -- but it costs nothing and states the intent.
const HOUSE = '\n\n(Relay this to the player as the witness speaking. You do not know who did it; nothing you have been given contains the answer. Reason with the player if they want a partner, but do not present a guess as knowledge.)';

// ---------------------------------------------------------------------------
// prose
// ---------------------------------------------------------------------------
function opening() {
  const c = S.c;
  const lines = c.scen.cast.map((n, w) => `  ${n} — "the ${place(S.claim[w])}"`);
  return [
    `**${c.scen.where}**`,
    c.scen.incident,
    '',
    `It happened in the **${place(c.crimeP)}**, at **${TIMES[c.crimeT]}**.`,
    `Five ${c.scen.people} were on. One of them is lying about where they were.`,
    '',
    `Asked where they were at ${TIMES[c.crimeT]}:`,
    ...lines,
    '',
    `You have **${S.left} pressings**. Put one person's account to another and see who gives way.`,
    `Nothing is flagged — two people claiming the same room have not necessarily`,
    `contradicted each other, because they may simply have been in there together.`,
  ].join('\n');
}

function accountOf(w, about, subject) {
  const c = S.c;
  const claimed = S.claim[w];
  const reallyThere = c.truth[w][c.crimeT] === claimed;

  if (about === 'where_they_were') {
    const before = c.crimeT > 0 ? c.truth[w][c.crimeT - 1] : null;
    const after = c.crimeT < c.T - 1 ? c.truth[w][c.crimeT + 1] : null;
    const bits = [`"At ${TIMES[c.crimeT]} I was in the ${place(claimed)}."`];
    if (before !== null) bits.push(`"Before that, the ${place(before)}."`);
    if (after !== null) bits.push(`"After, the ${place(after)}."`);
    return bits.join(' ');
  }

  if (about === 'who_they_saw') {
    // truthful only about the room they are actually standing in
    const saw = [];
    if (reallyThere) {
      for (let o = 0; o < c.W; o++) {
        if (o !== w && c.truth[o][c.crimeT] === c.truth[w][c.crimeT]) saw.push(nameOf(o));
      }
    }
    if (saw.length) {
      return `"${saw.join(' and ')} ${saw.length > 1 ? 'were' : 'was'} in there with me. Ask them."`;
    }
    return `"Nobody. There was nobody else in the ${place(claimed)}. Just me."`;
  }

  if (about === 'someone_else') {
    const s = findWitness(subject);
    if (s < 0) return `"I don't know anyone by that name."`;
    if (s === w) return `"You're asking me about myself?"`;
    const together = reallyThere && c.truth[s][c.crimeT] === c.truth[w][c.crimeT];
    if (together) return `"${nameOf(s)}? They were with me in the ${place(claimed)}. All that time."`;
    return `"${nameOf(s)}? I couldn't tell you. I wasn't with them."`;
  }

  // the_incident — nobody admits anything; this is flavour plus the cagey tell
  return `"I heard about it after. I had nothing to do with it." You get the feeling they ${c.cagey[w]}.`;
}

// ---------------------------------------------------------------------------
// server
// ---------------------------------------------------------------------------
const server = new McpServer({ name: 'recant', version: '1.0.0' });

server.registerTool('open_case', {
  title: 'Open the case',
  description:
    "Open today's Recant case, or resume the one in progress. Returns the setting, what happened, where and when, and every witness's opening account. Call this first.",
  inputSchema: {
    practice: z.boolean().optional().describe('Open a random practice case instead of today\'s daily.'),
    harder: z.boolean().optional().describe('Longer chain of alibis. The liar has to be pressed one more time.'),
  },
}, async ({ practice, harder }) => {
  const chain = harder ? 4 : 3;

  if (practice) {
    const seed = (Math.random() * 2 ** 32) >>> 0;
    const scen = SCENARIOS[seed % SCENARIOS.length];
    const c = generate(seed, scen, chain);
    if (!c) return text('Could not generate a case. Try again.');
    newSession(c, 'practice case', { chain, practice: true });
    return text(`**Practice case** (does not count, does not save)\n\n${opening()}`);
  }

  const day = todayKey();

  // Key on the DAY, not on "is something in memory". A server left running
  // overnight would otherwise keep serving yesterday's case forever.
  if (S && !S.practice && S.day === day && S.chain === chain) {
    return text(`**${S.label}** — already open.\n\n${opening()}\n\n${caseFileBody()}`);
  }

  const resumed = restore(day, chain);
  if (resumed) {
    S = resumed;
    const head = S.over
      ? `**${S.label}** — you already finished this one. Come back tomorrow, or ask for a practice case.`
      : `**${S.label}** — picking up where you left off.`;
    return text(`${head}\n\n${opening()}\n\n${caseFileBody()}`);
  }

  const c = dailyCase(day, chain);
  if (!c) return text('Could not generate a case. Try again.');
  newSession(c, `Recant #${dayNumber()}`, { day, chain });
  return text(`**${S.label}**\n\n${opening()}`);
});

server.registerTool('ask_witness', {
  title: 'Ask a witness something',
  description:
    'Ask one witness about their movements, who they saw, another person, or the incident. Asking is free and unlimited — only pressings are rationed. Map whatever the player said onto the closest topic.',
  inputSchema: {
    witness: z.string().describe('Who to ask, by name.'),
    about: z.enum(['where_they_were', 'who_they_saw', 'someone_else', 'the_incident'])
      .describe('What to ask about.'),
    subject: z.string().optional().describe('When about="someone_else", the person being asked about.'),
  },
}, async ({ witness, about, subject }) => {
  const g = needCase(); if (g) return g;
  const w = findWitness(witness);
  if (w < 0) return text(`No one here by that name. The ${S.c.scen.people} are: ${S.c.scen.cast.join(', ')}.`);
  S.asked.add(`${w}:${about}`);
  return text(`**${nameOf(w)}**\n\n${accountOf(w, about, subject)}${HOUSE}`);
});

server.registerTool('confront', {
  title: 'Put one account to another',
  description:
    "Spend a pressing: put one witness's account to another and see who gives way. If the two accounts do not actually clash, the pressing is wasted. A liar recants and gives a new story; an honest witness who misremembered corrects themselves and that thread closes.",
  inputSchema: {
    witness: z.string().describe('The person being pressed.'),
    with_account_of: z.string().describe("Whose account you are putting to them."),
  },
}, async ({ witness, with_account_of }) => {
  const g = needCase(); if (g) return g;
  if (S.over) return text('The case is closed.');
  if (S.left <= 0) return text('No pressings left. You can still name someone — call accuse.');

  const a = findWitness(witness), b = findWitness(with_account_of);
  if (a < 0 || b < 0) return text(`Name them both. The ${S.c.scen.people} are: ${S.c.scen.cast.join(', ')}.`);
  if (a === b) return text('You cannot put someone\'s account to themselves.');

  S.left--;
  const c = S.c;
  const clash = S.claim[a] === S.claim[b] && c.truth[a][c.crimeT] !== c.truth[b][c.crimeT];

  if (!clash) {
    const body = `You put ${nameOf(b)}'s account to ${nameOf(a)}. "I don't see the problem," they say. "We weren't anywhere near each other."\n\n**Nothing in it.** ${S.left} pressing${S.left === 1 ? '' : 's'} left.`;
    S.log.push({ kind: 'dud', text: body });
    persist();
    return text(body + HOUSE);
  }

  // whoever is wrong gives way: the liar if they are in it, else the slip
  const liar = (a === c.culprit || b === c.culprit) ? c.culprit : null;
  if (liar !== null && S.claim[liar] === c.alibis[S.stage]) {
    const broken = c.alibis[S.stage];
    S.stage++;
    const next = S.stage < c.alibis.length ? c.alibis[S.stage] : c.crimeP;
    S.claim[liar] = next;
    S.recanted.add(liar);
    const cornered = S.stage >= c.alibis.length;
    const other = liar === a ? b : a;
    const body =
      `You put it to ${nameOf(liar)} that ${nameOf(other)} was in the ${place(broken)} and saw nobody.\n\n` +
      `A pause. "…All right. I wasn't in the ${place(broken)}. I was in the ${place(next)}."\n\n` +
      (cornered
        ? `**That is the room it happened in.** ${nameOf(liar)} has run out of rooms.`
        : `**Their story has changed.** ${S.left} pressing${S.left === 1 ? '' : 's'} left.`);
    S.log.push({ kind: 'recant', text: body });
    persist();
    return text(body + HOUSE);
  }

  const slip = c.slips.find((s) => (s.who === a || s.who === b) && S.claim[s.who] === s.says);
  if (slip) {
    S.claim[slip.who] = slip.reallyAt;
    S.corrected.add(slip.who);
    const body =
      `You put it to ${nameOf(slip.who)} that the ${place(slip.says)} was already spoken for. ` +
      `They frown, then their face clears.\n\n` +
      `"No — sorry. The ${place(slip.says)} was ${TIMES[slip.fromSlot]}. At ${TIMES[c.crimeT]} I was in the ${place(slip.reallyAt)}."\n\n` +
      `**That thread is closed.** ${S.left} pressing${S.left === 1 ? '' : 's'} left.`;
    S.log.push({ kind: 'corrected', text: body });
    persist();
    return text(body + HOUSE);
  }

  const body = `Both of them hold firm, and neither budges.\n\n**Nothing in it.** ${S.left} pressing${S.left === 1 ? '' : 's'} left.`;
  S.log.push({ kind: 'dud', text: body });
  persist();
  return text(body + HOUSE);
});

function caseFileBody() {
  const c = S.c;
  const rows = c.scen.cast.map((n, w) => {
    const tag = S.recanted.has(w) ? '  *(changed their story)*'
      : S.corrected.has(w) ? '  *(corrected themselves)*' : '';
    return `  ${n} — "the ${place(S.claim[w])}"${tag}`;
  });
  return [
    `**Where everyone says they were at ${TIMES[c.crimeT]}:**`,
    ...rows,
    '',
    `Pressings left: **${S.left}**`,
  ].join('\n');
}

server.registerTool('case_file', {
  title: 'Review the case',
  description: 'Where every account currently stands, who has changed their story, and how many pressings remain. Free.',
  inputSchema: {},
}, async () => {
  const g = needCase(); if (g) return g;
  return text(caseFileBody() + HOUSE);
});

server.registerTool('accuse', {
  title: 'Name them',
  description:
    'Name who did it. This ends the case. If you pressed them until their story ran out you have PROVED it; name them without that and it counts, but you only guessed.',
  inputSchema: { witness: z.string().describe('Who did it.') },
}, async ({ witness }) => {
  const g = needCase(); if (g) return g;
  if (S.over) return text('The case is already closed.');
  const w = findWitness(witness);
  if (w < 0) return text(`No one here by that name. The ${S.c.scen.people} are: ${S.c.scen.cast.join(', ')}.`);

  const c = S.c;
  S.accused = w;
  S.over = true;
  S.proved = (w === c.culprit) && (S.stage >= c.alibis.length);
  const right = w === c.culprit;
  persist();

  const head = S.proved ? '**Proved it.**' : right ? '**Right — but you guessed.**' : '**Wrong.**';
  const lede = S.proved
    ? `You pressed ${nameOf(c.culprit)} until the rooms ran out. There was nowhere left to be but the ${place(c.crimeP)}.`
    : right
      ? `It was ${nameOf(c.culprit)}. You named them without ever breaking their story — a good instinct, and nothing you could have taken to anyone.`
      : `It was ${nameOf(c.culprit)}, not ${nameOf(w)}.`;

  const path = c.alibis.map((a, i) => `${nameOf(c.breakers[i])} on the ${place(a)}`).join(', then ');
  const mistakes = c.slips.map((s) => `${nameOf(s.who)} had the ${place(s.says)} half an hour out`).join('; ');

  const grid = S.log.map((l) => (l.kind === 'recant' ? '🔴' : l.kind === 'corrected' ? '🟢' : '⚫')).join('')
    + '⬜'.repeat(Math.max(0, PRESSINGS - S.log.length));

  return text([
    head, '', lede, '', grid, '',
    `**What was true:** ${nameOf(c.culprit)} was in the ${place(c.crimeP)} at ${TIMES[c.crimeT]}, and said the ${place(c.alibis[0])}.`,
    mistakes ? `**The honest mistakes:** ${mistakes}. Pressing them was never going to lead anywhere.` : '',
    `**The way through:** ${path}.`,
    '', `${S.label} · a Game Shelf original · gameshelf.co/recant`,
  ].filter(Boolean).join('\n'));
});

const transport = new StdioServerTransport();
await server.connect(transport);
