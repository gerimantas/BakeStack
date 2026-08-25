// Builds tools/qa-compare-data.json: pairs DOCx-derived sections (from the
// Pandoc .md conversion) against the parsed JSON records, for visual QA.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function extractH2Sections(mdPath) {
  const text = fs.readFileSync(mdPath, 'utf-8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      if (current) sections.push(current);
      current = { title: m[1].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.map(s => ({
    title: s.title,
    body: s.body.join('\n').trim(),
  }));
}

function buildSet(mdFile, jsonFile, key) {
  const sections = extractH2Sections(path.join(ROOT, mdFile));
  const jsonData = JSON.parse(fs.readFileSync(path.join(ROOT, jsonFile), 'utf-8'));
  const jsonByTitle = new Map(jsonData.map(r => [r.title.trim(), r]));

  const rows = sections.map(s => ({
    title: s.title,
    docx: s.body,
    json: jsonByTitle.get(s.title) || null,
  }));

  // JSON entries with no matching DOCx H2 (e.g. mis-split subsections)
  const docxTitleSet = new Set(sections.map(s => s.title));
  const extraJson = jsonData
    .filter(r => !docxTitleSet.has(r.title.trim()))
    .map(r => ({ title: r.title, docx: null, json: r }));

  return rows.concat(extraJson);
}

const recipes = buildSet('Receptai.md', 'recipes.json', 'title');
const tips = buildSet('Patarimai.md', 'tips.json', 'title');

const out = { recipes, tips };
const outDir = path.join(ROOT, 'tools');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'qa-compare-data.json'), JSON.stringify(out));

console.log('recipes:', recipes.length, '(missing json:', recipes.filter(r => !r.json).length, ')');
console.log('tips:', tips.length, '(missing json:', tips.filter(r => !r.json).length, ', extra json:', tips.filter(r => !r.docx).length, ')');
