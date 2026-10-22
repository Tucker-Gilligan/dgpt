import { readFileSync, writeFileSync } from 'node:fs';
const [mode, target, path] = process.argv.slice(2);
if (!['save', 'verify'].includes(mode) || !['qa', 'production'].includes(target) || !path) throw new Error('Usage: content-snapshot.mjs save|verify qa|production <snapshot-path>');
const environments = JSON.parse(readFileSync(new URL('../environments.json', import.meta.url)));
const response = await fetch(`${environments[target].url}/api/content`, { cache: 'no-store' });
if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
const content = await response.json();
if (mode === 'save') {
  writeFileSync(path, JSON.stringify({ target, capturedAt: new Date().toISOString(), content }, null, 2), { mode: 0o600 });
  console.log(`Saved ${target} content snapshot.`);
} else {
  const before = JSON.parse(readFileSync(path));
  if (before.target !== target) throw new Error('Snapshot environment mismatch.');
  const changed = Object.keys(before.content).filter(key => JSON.stringify(before.content[key]) !== JSON.stringify(content[key]));
  if (changed.length) throw new Error(`Content differs in: ${changed.join(', ')}. Investigate concurrent admin edits; never restore automatically.`);
  console.log(`Verified: all previously saved ${target} fields are unchanged.`);
}
