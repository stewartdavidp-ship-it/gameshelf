// Two tests, both of which have to be able to fail.
//
// 1. PARITY. The web game carries its own inline copy of the engine (Game Shelf
//    games are a single self-contained file). If the two copies ever drift, the
//    phone and the chat version disagree about who did it on a given day, and
//    nothing would tell you. So: extract the browser copy, run both over the
//    same seeds, and compare the full case object.
//
// 2. END TO END. Drive the real MCP server over stdio with a real client and
//    play a case through to "proved", plus check the things that must never
//    happen -- the answer must not appear in any result before the accusation,
//    and a wasted pressing must actually cost one.

import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as mine from './engine.mjs';

const here = dirname(fileURLToPath(import.meta.url));
let failures = 0;
const ok = (name, cond, detail = '') => {
  if (cond) console.log(`  PASS  ${name}`);
  else { console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); failures++; }
};

// ---------------------------------------------------------------------------
console.log('\n1. engine parity — browser copy vs canonical copy');

const html = readFileSync(join(here, '..', 'recant', 'index.html'), 'utf8');
const m = html.match(/\/\* >>> RECANT-ENGINE[\s\S]*?\*\/([\s\S]*?)\/\* <<< RECANT-ENGINE \*\//);
if (!m) {
  ok('engine block found in recant/index.html', false, 'markers missing');
} else {
  const src = m[1];
  // the browser copy declares with `var` / `function`, so evaluating it in a
  // function scope and handing back the names is enough
  const factory = new Function(`${src}; return { TIMES, rng, SCENARIOS, CAGEY, generate, conflicts, verify };`);
  const theirs = factory();

  ok('browser copy exports the engine', typeof theirs.generate === 'function');
  ok('TIMES identical', JSON.stringify(theirs.TIMES) === JSON.stringify(mine.TIMES));
  ok('SCENARIOS identical', JSON.stringify(theirs.SCENARIOS) === JSON.stringify(mine.SCENARIOS),
     `${theirs.SCENARIOS?.length} vs ${mine.SCENARIOS.length}`);
  ok('CAGEY identical', JSON.stringify(theirs.CAGEY) === JSON.stringify(mine.CAGEY));

  let diverged = 0, made = 0, firstBad = null;
  for (let d = 1; d <= 1500; d++) {
    const seed = (d * 7919) >>> 0;
    const scen = mine.SCENARIOS[seed % mine.SCENARIOS.length];
    const a = theirs.generate(seed, scen, 3, 2);
    const b = mine.generate(seed, scen, 3, 2);
    if (!a && !b) continue;
    made++;
    const norm = (c) => c && JSON.stringify({
      crimeT: c.crimeT, crimeP: c.crimeP, culprit: c.culprit,
      truth: c.truth, claim: c.claim, alibis: c.alibis, breakers: c.breakers,
      slips: c.slips, cagey: c.cagey,
    });
    if (norm(a) !== norm(b)) { diverged++; if (!firstBad) firstBad = seed; }
  }
  ok(`${made} cases generated identically by both copies`, diverged === 0,
     diverged ? `${diverged} diverged, first at seed ${firstBad}` : '');

  // the parity check must be capable of failing
  const sabotaged = theirs.generate(7919, mine.SCENARIOS[0], 4, 2);
  const straight = mine.generate(7919, mine.SCENARIOS[0], 3, 2);
  ok('parity check has teeth (different params => different case)',
     JSON.stringify(sabotaged?.alibis) !== JSON.stringify(straight?.alibis));
}

// ---------------------------------------------------------------------------
console.log('\n1b. golden cases — the cross-RUNTIME guard');
// The parity test above runs BOTH copies inside this one Node process, so it is
// structurally blind to a divergence caused by the JS engine rather than the
// source. That is not hypothetical: `sort(() => rand() - 0.5)` is an
// inconsistent comparator, so the number of rand() calls it consumes varies by
// engine, and Node and the browser silently generated DIFFERENT cases from the
// same seed on live gameshelf.co (2026-09-23). Pinning the output catches it.
{
  const lines = readFileSync(join(here, 'fixtures', 'cases.txt'), 'utf8')
    .split('\n').filter((l) => l && !l.startsWith('#'));
  let bad = 0, firstBad = null;
  for (const line of lines) {
    const [seedS, crimeP, crimeT, culprit, claim, alibis, breakers] = line.split('|');
    const seed = Number(seedS);
    const scen = mine.SCENARIOS[seed % mine.SCENARIOS.length];
    const c = mine.generate(seed, scen, 3, 2);
    const got = c ? [c.crimeP, c.crimeT, c.culprit, c.claim.join(''), c.alibis.join(''), c.breakers.join('')].join('|') : 'null';
    const want = [crimeP, crimeT, culprit, claim, alibis, breakers].join('|');
    if (got !== want) { bad++; if (firstBad === null) firstBad = `${seed}: got ${got}, want ${want}`; }
  }
  ok(`${lines.length} golden cases reproduce exactly`, bad === 0, firstBad || '');
  ok('generator uses no order-unstable sort', (() => {
    const src = readFileSync(join(here, 'engine.mjs'), 'utf8')
      .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    return !/\.sort\s*\(/.test(src);
  })(), 'a .sort() reappeared in engine.mjs');
  ok('browser copy uses no order-unstable sort', !/\.sort\s*\(/.test(
    html.match(/\/\* >>> RECANT-ENGINE[\s\S]*?\*\/([\s\S]*?)\/\* <<< RECANT-ENGINE \*\//)[1]
      .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')));
}

// ---------------------------------------------------------------------------
console.log('\n2. case invariants');
{
  let n = 0, soleLead = 0, badChain = 0;
  for (let d = 1; d <= 2000; d++) {
    const c = mine.dailyCase(`seed-${d}`);
    if (!c) continue;
    n++;
    const conf = mine.conflicts(c);
    const inv = new Set();
    conf.forEach((x) => { inv.add(x.a); inv.add(x.b); });
    if (inv.size < 3 || !inv.has(c.culprit)) soleLead++;
    for (let i = 0; i < c.alibis.length; i++) {
      if (c.truth[c.breakers[i]][c.crimeT] !== c.alibis[i]) badChain++;
    }
  }
  ok(`${n} daily keys all produced a case`, n === 2000, `${n}/2000`);
  ok('culprit never the only lead on the opening board', soleLead === 0, `${soleLead} bad`);
  ok('every alibi has a breaker who was genuinely alone there', badChain === 0, `${badChain} bad`);
}

// ---------------------------------------------------------------------------
console.log('\n3. end to end over MCP stdio');

// isolate: a saved game from a previous run would otherwise be restored and
// the suite would fail against its own leftovers
const tmpState = mkdtempSync(join(tmpdir(), 'recant-test-'));
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [join(here, 'server.mjs')],
  env: { ...process.env, RECANT_STATE_DIR: tmpState },
});
const client = new Client({ name: 'recant-test', version: '1.0.0' });
await client.connect(transport);

const tools = (await client.listTools()).tools.map((t) => t.name).sort();
ok('tools exposed', JSON.stringify(tools) === JSON.stringify(['accuse', 'ask_witness', 'case_file', 'confront', 'open_case']),
   tools.join(','));

const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  return r.content.map((x) => x.text).join('\n');
};

// Work out the truth independently so the test can play correctly. The SERVER
// never tells us; we recompute from the same daily key.
const truthCase = mine.dailyCase(mine.todayKey(), 3);
const cast = truthCase.scen.cast;
const culprit = cast[truthCase.culprit];
const chain = truthCase.alibis.map((a) => truthCase.scen.places[a]);
const breakers = truthCase.breakers.map((b) => cast[b]);

const open = await call('open_case');
ok('case opens', open.includes(truthCase.scen.where));
ok('opening does NOT name the culprit as guilty', !/did it|guilty|the culprit is/i.test(open));

const leak = [open];
const q = await call('ask_witness', { witness: cast[0], about: 'where_they_were' });
leak.push(q);
ok('asking a witness is free', (await call('case_file')).includes(`**${mine.PRESSINGS}**`));

// a deliberately wasted pressing: two people whose claims do not clash
let dudPair = null;
for (let a = 0; a < 5 && !dudPair; a++) {
  for (let b = a + 1; b < 5; b++) {
    if (truthCase.claim[a] !== truthCase.claim[b]) { dudPair = [cast[a], cast[b]]; break; }
  }
}
const dud = await call('confront', { witness: dudPair[0], with_account_of: dudPair[1] });
leak.push(dud);
ok('a pressing with no clash is wasted', /Nothing in it/.test(dud));
ok('and it costs one', (await call('case_file')).includes(`**${mine.PRESSINGS - 1}**`));

// now walk the chain
let cornered = false;
for (let i = 0; i < chain.length; i++) {
  const r = await call('confront', { witness: culprit, with_account_of: breakers[i] });
  leak.push(r);
  if (i < chain.length - 1) {
    if (!r.includes('Their story has changed')) ok(`chain step ${i + 1} recants`, false, r.slice(0, 120));
  } else if (r.includes('run out of rooms')) cornered = true;
}
ok('the chain corners the liar', cornered);

// THE IMPORTANT ONE: nothing before the accusation may contain the answer
const spoiled = leak.some((t) => /\bit was\b/i.test(t) || /the culprit\b/i.test(t) || /What was true/i.test(t));
ok('no result leaked the answer before the accusation', !spoiled);

const verdict = await call('accuse', { witness: culprit });
ok('accusing the cornered liar proves it', verdict.includes('Proved it'));
ok('debrief names the real culprit', verdict.includes(culprit));
ok('debrief shows the way through', verdict.includes('The way through'));

const after = await call('confront', { witness: cast[0], with_account_of: cast[1] });
ok('case is closed to further pressings', /closed/i.test(after));

// 4. progress must survive a restart, or there is no daily game -- an MCP
//    client spawns the server per conversation, so this happens constantly.
{
  const t2 = new StdioClientTransport({
    command: process.execPath, args: [join(here, 'server.mjs')],
    env: { ...process.env, RECANT_STATE_DIR: tmpState },
  });
  const c2 = new Client({ name: 'recant-test-2', version: '1.0.0' });
  await c2.connect(t2);
  const r = await c2.callTool({ name: 'open_case', arguments: {} });
  const body = r.content.map((x) => x.text).join('\n');
  ok('a finished case is still finished after a restart', /already finished/i.test(body), body.split('\n')[0]);
  await c2.close();
}

await client.close();

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}\n`);
process.exit(failures === 0 ? 0 : 1);
