import fs from 'node:fs';

const path = new URL('../client/src/data/storyMap.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const patterns = [
  ['macro_angle', /<<[^>]*>>/g],
  ['macro_parenthesis', /\((?:set|button|click|link|go-to|goto|replace|append|else-if|else|if|either|history|text-colour|bg|meter|cacheaudio|random|prompt|display|print|toggle|audio|stop)\s*:?[^)]*\)/gi],
  ['macro_unknown', /\([a-z][\w-]*\s*:/gi],
  ['double_bracket', /\[\[[^\]]*\]\]/g],
  ['orphan_bracket', /(?<!\[)\[[^\]\n]+(?<!\])\](?!\])/g],
  ['passage_marker', /(?:==>|<==|=>|<===)/g],
  ['twine_markup', /(?:\\\\|\{\s*\})/g],
  ['variable_reference', /\$[\wÀ-ÿ_]+/g],
  ['markdown_emphasis', /\*{1,3}[^*\n]+\*{1,3}/g],
];
const rows = [];
for (const passage of data.passages) {
  const text = passage.text ?? '';
  const findings = [];
  for (const [name, regex] of patterns) {
    const matches = text.match(regex) ?? [];
    if (matches.length) findings.push({ name, count: matches.length, samples: [...new Set(matches)].slice(0, 4) });
  }
  if (findings.length) rows.push({ pid: passage.pid, name: passage.name, findings });
}
const summary = {};
for (const row of rows) for (const finding of row.findings) summary[finding.name] = (summary[finding.name] ?? 0) + finding.count;
const report = { passageCount: data.passages.length, affectedPassages: rows.length, summary, rows };
fs.writeFileSync(new URL('../twine-audit-report.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passageCount: report.passageCount, affectedPassages: report.affectedPassages, summary }, null, 2));
for (const row of rows.slice(0, 20)) console.log(`${row.pid} ${row.name}: ${row.findings.map((item) => `${item.name}=${item.count}`).join(', ')}`);
