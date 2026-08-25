// Applies the manually-reviewed H3 decisions to Patarimai.md, producing a
// corrected version where mis-split subsections are merged back into their
// parent tip, and genuinely mixed blocks (multiple articles glued together
// by a missed heading) are split at the right point.
//
// Input:  Patarimai.md (original), tools/blocks-debug.json (raw blocks),
//         tools/h3-decisions.json (manual per-block decision)
// Output: Patarimai.fixed.md — re-run parse_tips.py against this, not the
//         original, once spot-checked.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const blocks = require('./blocks-debug.json'); // {level, title, body}[]
const decisions = require('./h3-decisions.json'); // {idx: DECISION}

// Manual split points: exact substring in the block's body where a second
// (unheaded) article begins. Found by reading each flagged block in full.
const SPLIT_POINTS = {
  9: {
    marker: 'Why baking soda ≠ baking powder?',
    // text before marker keeps the original title; text from marker on
    // becomes an intro paragraph prepended to the NEXT block (idx 10)
  },
  13: [
    // idx 13 "Substitution" mixes 3 unrelated articles glued together
    { marker: 'Why does crème anglaise turn out silky and delicate for some' },
    { marker: 'Butter — the ideal fat for any baked goods' },
    { marker: 'ugar: Caramelization and the Maillard reaction' }, // dropped leading "S" in source extraction
  ],
  51: {
    marker: 'How to cover a cake with crumbs neatly?',
  },
  206: {
    marker: 'HONEY CAKE LAYERS: FACTORS THAT AFFECT THE INTENSITY OF HONEY TASTE AND AROMA',
  },
};

function splitBody(body, marker) {
  const idx = body.indexOf(marker);
  if (idx === -1) throw new Error(`marker not found: ${marker}`);
  return [body.slice(0, idx).trim(), body.slice(idx).trim()];
}

// Step 1: pre-process blocks that need internal splitting into extra
// synthetic blocks, so the rest of the pipeline treats them uniformly.
let working = blocks.map((b, i) => ({ ...b, origIdx: i }));

function insertAfter(arr, idx, newBlock) {
  const pos = arr.findIndex(b => b.origIdx === idx);
  arr.splice(pos + 1, 0, newBlock);
}

// idx 9: tail is the intro paragraph for the NEXT kept block ("Baking soda",
// idx 10) - prepend it directly to that block's body rather than merging it
// backward into idx 9's own content.
{
  const b = working.find(x => x.origIdx === 9);
  const [head, tail] = splitBody(b.body, SPLIT_POINTS[9].marker);
  b.body = head;
  const next = working.find(x => x.origIdx === 10);
  next.body = (tail.trim() + '\n\n' + next.body.trim()).trim();
}

// idx 13: split into 4 parts (soda/powder substitution + 3 unrelated articles)
{
  const b = working.find(x => x.origIdx === 13);
  const markers = SPLIT_POINTS[13].map(s => s.marker);
  let rest = b.body;
  const parts = [];
  for (const m of markers) {
    const [head, tail] = splitBody(rest, m);
    parts.push(head);
    rest = tail;
  }
  parts.push(rest); // last remaining chunk (Maillard section to end)
  b.body = parts[0]; // "Substitution" keeps its real content
  // parts[1] = crème anglaise article (headless -> promote to its own H2)
  // parts[2] = butter article (headless -> promote to its own H2)
  // parts[3] = sugar/Maillard article (headless -> promote to its own H2)
  insertAfter(working, 13, { level: 2, title: 'Why Does Crème Anglaise Curdle? (Cooking Method)', body: parts[1], origIdx: 13.1 });
  insertAfter(working, 13.1, { level: 2, title: 'Butter: Advantages, Drawbacks, and Creaming Temperature', body: parts[2], origIdx: 13.2 });
  insertAfter(working, 13.2, { level: 2, title: 'Sugar: Caramelization and the Maillard Reaction', body: parts[3].replace(/^ugar:/, 'Sugar:'), origIdx: 13.3 });
}

// idx 51: tail is an unrelated "how to cover a cake with crumbs" tip
{
  const b = working.find(x => x.origIdx === 51);
  const [head, tail] = splitBody(b.body, SPLIT_POINTS[51].marker);
  b.body = head;
  insertAfter(working, 51, { level: 2, title: 'How to Cover a Cake with Crumbs Neatly', body: tail, origIdx: 51.5 });
}

// idx 206: tail is an unrelated honey-cake-layers article
{
  const b = working.find(x => x.origIdx === 206);
  const [head, tail] = splitBody(b.body, SPLIT_POINTS[206].marker);
  b.body = head;
  insertAfter(working, 206, { level: 2, title: 'Honey Cake Layers: Factors That Affect the Intensity of Honey Taste and Aroma', body: tail, origIdx: 206.5 });
}

// Step 2: walk the (now split) list, applying the per-block decision.
// - null (no decision recorded, e.g. an untouched H2): starts a fresh record.
// - KEEP: starts a fresh record (title stays user-visible).
// - MERGE: folds this block's body into the current running record, title
//   dropped (a merged block's title was never meant to be user-visible —
//   that's the whole bug being fixed).
// - GROUP_<name>: all blocks sharing the same group name fold into ONE new
//   synthetic tip, keyed by name so multiple groups can be open logically
//   (only one is ever "current" at a time since blocks are visited in order).

const GROUP_TITLES = {
  GROUP_CURDLE: 'Why Does Crème Anglaise Curdle? Reasons and Fixes',
  GROUP_GANACHE: 'Ganache Components: Liquid, Butter, Sugar, and Additives',
};

const result = [];
let current = null;
let openGroup = null; // { key, block }

function closeGroup() {
  if (openGroup) { result.push(openGroup.block); openGroup = null; }
}

for (const b of working) {
  const decision = b.syntheticMergeForward
    ? 'MERGE'
    : (decisions[b.origIdx] !== undefined ? decisions[b.origIdx] : null);

  if (decision && decision.startsWith('GROUP_')) {
    if (!openGroup || openGroup.key !== decision) {
      closeGroup();
      openGroup = { key: decision, block: { level: 2, title: GROUP_TITLES[decision], body: '' } };
    }
    openGroup.block.body = (openGroup.block.body.trimEnd() + '\n\n' + b.title + '\n' + b.body.trim()).trim();
    continue;
  }

  if (decision === 'MERGE') {
    closeGroup();
    if (!current) { current = { level: b.level, title: b.title, body: '' }; result.push(current); }
    current.body = (current.body.trimEnd() + '\n\n' + b.body.trim()).trim();
    continue;
  }

  // KEEP, or no decision (untouched H2/H3) - always starts a fresh record
  closeGroup();
  current = { level: b.level, title: b.title, body: b.body };
  result.push(current);
}
closeGroup();

// Step 3: re-serialize to Markdown in the exact heading format parse_tips.py expects.
const lines = [];
for (const b of result) {
  const hashes = '#'.repeat(b.level);
  lines.push(`${hashes} ${b.title}`);
  lines.push('');
  lines.push(b.body);
  lines.push('');
}
const outMd = lines.join('\n').replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(path.join(ROOT, 'Patarimai.fixed.md'), outMd, 'utf-8');

console.log('input blocks:', blocks.length, '-> output blocks:', result.length);
console.log('wrote Patarimai.fixed.md');
