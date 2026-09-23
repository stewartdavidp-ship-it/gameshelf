// RECANT — the case engine.
//
// This is the same generator that runs inside recant/index.html. It is the
// canonical copy; `npm test` checks the web game's inline copy still produces
// identical cases for the same seeds, because a silent divergence would mean
// the phone and the chat versions disagree about the answer to today's case.
//
// The fiction and the logic are the same object:
//   - an INNOCENT confronted with a conflict EXPLAINS it; the thread closes.
//   - the CULPRIT confronted with a conflict RECANTS; a new conflict opens.
// Corner them through the chain of recantations and you have proved it.
//
// The decoys are the subtle part. Two innocents genuinely in the same room
// CORROBORATE each other, which is an alibi, not a conflict. So a decoy must be
// an honest witness who is WRONG -- someone off by one half-hour. Without those,
// the liar's story is the only loose thread on the board and the case ends on
// the first pressing.

export const TIMES = ['half eight', 'nine', 'half nine', 'ten', 'half ten'];
export const PRESSINGS = 4;

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SCENARIOS = [
  { id: 'depot', where: 'The night shift at a parcel depot', incident: 'Someone opened the cage and walked off with a pallet of phones.', people: 'loaders',
    cast: ['Okonjo', 'Pryce', 'Halloran', 'Vasquez', 'Behrens'], places: ['loading bay', 'sorting hall', 'cage', 'break room', 'yard office'] },
  { id: 'station', where: 'A research station in winter', incident: 'The sample freezer was switched off and three years of work thawed.', people: 'crew',
    cast: ['Aldridge', 'Strand', 'Nkemdirim', 'Beaufort', 'Lindqvist'], places: ['greenhouse', 'comms room', 'cold store', 'generator shed', 'mess'] },
  { id: 'newsroom', where: 'A newsroom the night before publication', incident: 'The embargoed story was leaked to a rival.', people: 'journalists',
    cast: ['Ferreira', 'Quill', 'Adeyemi', 'Sokolov', 'Mbeki'], places: ['copy desk', 'archive', 'studio', 'roof terrace', 'server room'] },
  { id: 'filmset', where: 'A film set between takes', incident: "The only print of the day's footage was wiped.", people: 'crew',
    cast: ['Castellan', 'Osei', 'Marchetti', 'Dunbar', 'Yusupova'], places: ['sound stage', 'edit truck', 'wardrobe', 'green room', 'back lot'] },
  { id: 'aquarium', where: 'An aquarium after closing', incident: 'The tank valves were opened and the reef exhibit nearly drained.', people: 'keepers',
    cast: ['Renwick', 'Achebe', 'Sorensen', 'Patel', 'Moreau'], places: ['reef hall', 'quarantine room', 'filtration deck', 'gift shop', 'loading dock'] },
  { id: 'bakery', where: 'A bakery before dawn', incident: 'The competition sourdough starter was poured down the drain.', people: 'bakers',
    cast: ['Whitlock', 'Ibrahim', 'Kowalczyk', 'Amaro', 'Fenn'], places: ['proving room', 'cold room', 'front counter', 'yard', 'office'] },
  { id: 'observatory', where: 'An observatory on a clear night', incident: "The telescope's mirror was scratched beyond repair.", people: 'astronomers',
    cast: ['Halvorsen', 'Rao', 'Dimitrov', 'Ngata', 'Cleary'], places: ['dome', 'control room', 'library', 'workshop', 'car park'] },
  { id: 'theatre', where: 'A theatre on opening night', incident: "The lead's costume was cut to ribbons an hour before curtain.", people: 'company',
    cast: ['Pemberton', 'Diallo', 'Rossi', 'Okafor', 'Tarrant'], places: ['wings', 'dressing rooms', 'flies', 'orchestra pit', 'box office'] },
  { id: 'startup', where: 'An office the weekend before launch', incident: 'The production database was dropped, and the backups with it.', people: 'engineers',
    cast: ['Zhao', 'Brennan', 'Haddad', 'Lindgren', 'Osborne'], places: ['war room', 'kitchen', 'phone booth', 'roof', 'basement'] },
  { id: 'ferry', where: 'An overnight ferry', incident: "The purser's safe was emptied somewhere between two ports.", people: 'crew',
    cast: ['Halvard', 'Nunes', 'Quintero', 'Fairweather', 'Adamu'], places: ['bridge', 'galley', 'engine room', 'car deck', 'lounge'] },
  { id: 'archive', where: 'A records office during an audit', incident: 'A whole year of files went into the shredder.', people: 'clerks',
    cast: ['Tennant', 'Boateng', 'Ruiz', 'Lindholm', 'Choudhury'], places: ['reading room', 'stacks', 'scanning bay', 'mail room', 'loading dock'] },
  { id: 'ski', where: 'A ski lodge kitchen at turnaround', incident: "The season's entire wine order was poured away.", people: 'staff',
    cast: ['Girard', 'Mensah', 'Novak', 'Sinclair', 'Takahashi'], places: ['cellar', 'kitchen', 'boot room', 'terrace', 'drying room'] },
  { id: 'radio', where: 'A radio station overnight', incident: 'The transmitter was cut in the middle of the appeal.', people: 'presenters',
    cast: ['Oyelaran', 'Baptiste', 'Kerr', 'Solberg', 'Marlowe'], places: ['studio one', 'continuity', 'record library', 'mast room', 'reception'] },
  { id: 'greenhouse', where: 'A garden centre out of season', incident: 'The heaters were killed and the whole orchid house was lost.', people: 'growers',
    cast: ['Ashworth', 'Nwosu', 'Bergstrom', 'Cardoza', 'Finch'], places: ['orchid house', 'potting shed', 'cold frames', 'shop floor', 'boiler room'] },
  { id: 'printworks', where: 'A print works on a deadline', incident: 'The plates for the morning run were destroyed.', people: 'printers',
    cast: ['Deveraux', 'Salah', 'Kaminski', 'Oduya', 'Priestley'], places: ['press hall', 'plate room', 'ink store', 'bindery', 'dispatch'] },
  { id: 'hospital', where: 'A hospital ward on a quiet night', incident: 'The controlled drugs cabinet was emptied.', people: 'staff',
    cast: ['Aitken', 'Balogun', 'Ferrara', 'Mackenzie', 'Rahman'], places: ['treatment room', "nurses' station", 'side room', 'linen store', 'stairwell'] },
  { id: 'vineyard', where: 'A vineyard at harvest', incident: 'The fermentation tanks were opened and the vintage spoiled.', people: 'pickers',
    cast: ['Lauriston', 'Okoro', 'Benedetti', 'Haugen', 'Cruz'], places: ['press house', 'tank room', 'barrel store', 'east rows', 'weighbridge'] },
  { id: 'museum', where: 'A museum during an install', incident: 'The loaned bronze never made it into the exhibition.', people: 'technicians',
    cast: ['Garnier', 'Umeh', 'Lindqvist', 'Ravel', 'Stannard'], places: ['main gallery', 'crate store', 'conservation lab', 'loading bay', 'staff corridor'] },
];

// Everyone is cagey about something. If only the guilty squirmed, manner would
// be a tell and the logic would never have to do any work.
export const CAGEY = [
  'were on the phone to someone they should not have been',
  'had been asleep for twenty minutes and would rather that did not come up',
  'were three cigarettes into a shift they had promised to give up',
  'had taken something small from the stores, and it was not this',
  'were avoiding someone and took the long way round',
  'had been crying and did not want to be asked why',
  'were reading a message they should have answered a week ago',
  'had already clocked out and come back in',
];

export function generate(seed, scen, chain = 3, slips = 2) {
  const rand = rng(seed);
  const W = scen.cast.length, P = scen.places.length, T = TIMES.length;

  for (let attempt = 0; attempt < 900; attempt++) {
    const crimeT = 1 + Math.floor(rand() * (T - 2));
    const crimeP = Math.floor(rand() * P);
    const culprit = Math.floor(rand() * W);

    const truth = [];
    for (let w = 0; w < W; w++) {
      truth[w] = [];
      for (let t = 0; t < T; t++) truth[w][t] = Math.floor(rand() * P);
    }
    truth[culprit][crimeT] = crimeP;
    for (let w = 0; w < W; w++) {
      if (w !== culprit && truth[w][crimeT] === crimeP) {
        truth[w][crimeT] = (crimeP + 1 + Math.floor(rand() * (P - 1))) % P;
      }
    }

    // Each alibi must be a room where exactly ONE other person genuinely was,
    // alone. That person is the breaker: they can say the room was empty but
    // for them.
    const soloAt = {};
    for (let w = 0; w < W; w++) {
      if (w === culprit) continue;
      const p = truth[w][crimeT];
      if (p === crimeP) continue;
      (soloAt[p] = soloAt[p] || []).push(w);
    }
    const usable = Object.keys(soloAt).map(Number).filter((p) => soloAt[p].length === 1);
    if (usable.length < chain) continue;
    usable.sort(() => rand() - 0.5);
    const alibis = usable.slice(0, chain);
    const breakers = alibis.map((p) => soloAt[p][0]);

    // memory slips: honest witnesses, off by one half-hour
    const slipSet = [];
    const free = [];
    for (let w = 0; w < W; w++) if (w !== culprit && breakers.indexOf(w) < 0) free.push(w);
    free.sort(() => rand() - 0.5);
    for (let i = 0; i < free.length && slipSet.length < slips; i++) {
      const ww = free[i];
      const dir = rand() < 0.5 ? -1 : 1;
      const src = Math.max(0, Math.min(T - 1, crimeT + dir));
      if (src === crimeT) continue;
      if (truth[ww][src] === truth[ww][crimeT]) continue;
      if (truth[ww][src] === crimeP) continue;
      slipSet.push({ who: ww, says: truth[ww][src], reallyAt: truth[ww][crimeT], fromSlot: src });
    }
    if (!slipSet.length) continue;

    const claim = [];
    for (let w = 0; w < W; w++) claim[w] = truth[w][crimeT];
    claim[culprit] = alibis[0];
    for (let i = 0; i < slipSet.length; i++) claim[slipSet[i].who] = slipSet[i].says;

    const cagey = [];
    for (let w = 0; w < W; w++) cagey[w] = CAGEY[Math.floor(rand() * CAGEY.length)];

    const c = { seed, scen, crimeT, crimeP, culprit, truth, claim, alibis, breakers, slips: slipSet, cagey, W, P, T };
    if (verify(c)) return c;
  }
  return null;
}

// A conflict is a claimed co-location that is NOT corroborated: two people put
// themselves in the same room, but were not actually together.
export function conflicts(c, claim) {
  claim = claim || c.claim;
  const out = [];
  for (let a = 0; a < c.W; a++) {
    for (let b = a + 1; b < c.W; b++) {
      if (claim[a] !== claim[b]) continue;
      if (c.truth[a][c.crimeT] === c.truth[b][c.crimeT]) continue; // genuinely together
      out.push({ a, b, room: claim[a] });
    }
  }
  return out;
}

export function verify(c) {
  if (c.truth[c.culprit][c.crimeT] !== c.crimeP) return false;
  for (let w = 0; w < c.W; w++) {
    if (w !== c.culprit && c.truth[w][c.crimeT] === c.crimeP) return false;
  }
  const seen = {};
  for (let i = 0; i < c.alibis.length; i++) {
    if (c.alibis[i] === c.crimeP) return false;
    if (seen[c.alibis[i]]) return false;
    seen[c.alibis[i]] = 1;
    const b = c.breakers[i];
    if (b === c.culprit) return false;
    if (c.truth[b][c.crimeT] !== c.alibis[i]) return false;
  }
  for (let i = 0; i < c.slips.length; i++) {
    if (c.slips[i].who === c.culprit) return false;
    if (c.slips[i].says === c.crimeP) return false;
  }
  // THE GATE: the opening board must not single the liar out. At least three
  // people must be caught in an unresolved conflict, and the liar must be one
  // of them, or there is nothing to press.
  const conf = conflicts(c);
  const inv = {};
  for (let i = 0; i < conf.length; i++) { inv[conf[i].a] = 1; inv[conf[i].b] = 1; }
  if (!inv[c.culprit]) return false;
  if (Object.keys(inv).length < 3) return false;
  return true;
}

export function par(c) { return c.alibis.length; }

// ---------------------------------------------------------------------------
// Daily selection. The phone and the chat versions must land on the SAME case,
// so both derive the seed from the calendar date the same way.
// ---------------------------------------------------------------------------
export function todayKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function dayNumber(d = new Date()) {
  const epoch = Date.UTC(2026, 0, 1);
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((today - epoch) / 86400000);
}

export function seedFor(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function dailyCase(key = todayKey(), chain = 3) {
  const seed = seedFor(key);
  const scen = SCENARIOS[seed % SCENARIOS.length];
  for (let bump = 0; bump < 40; bump++) {
    const c = generate((seed + bump * 7919) >>> 0, scen, chain);
    if (c) return c;
  }
  return generate(12345, SCENARIOS[0], chain);
}
