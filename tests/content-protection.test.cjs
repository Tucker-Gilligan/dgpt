const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const { DatabaseSync } = require('node:sqlite');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const env = {};
const originalLoad = Module._load;
Module._load = function(id, ...args) { return id === 'cloudflare:workers' ? { env } : originalLoad.call(this, id, ...args); };
for (const extension of ['.ts', '.tsx']) Module._extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
const { defaultContent, normalizeContent } = require('../lib/site-content.ts');
const { changedFields } = require('../lib/content-edits.ts');
const { SitePage } = require('../app/page.tsx');
const route = require('../app/api/content/route.ts');
function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(fs.readFileSync('drizzle/0000_shallow_nebula.sql', 'utf8'));
  sql.prepare('INSERT INTO site_content (key, value) VALUES (?, ?)').run('public-site', JSON.stringify({ ...defaultContent, heroTitle: 'Saved headline', heroNote: 'Medicare and OON insurance will be accepted — custom wording' }));
  sql.exec(fs.readFileSync('drizzle/0001_broken_the_stranger.sql', 'utf8'));
  env.ADMIN_PASSWORD = 'test-only';
  env.DB = { prepare(query) { let bindings = []; const adapter = { bind(...values) { bindings = values; return adapter; }, async first() { return sql.prepare(query).get(...bindings) || null; }, async all() { return { results: sql.prepare(query).all(...bindings) }; }, async run() { return { meta: { changes: Number(sql.prepare(query).run(...bindings).changes) } }; } }; return adapter; } };
  return sql;
}
function request(method, body, authorized = true, suffix = '') { return new Request(`https://example.test/api/content${suffix}`, { method, headers: { ...(authorized ? { 'x-dgpt-admin-password': 'test-only' } : {}), 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }); }

test('partial saves, atomic conflict rejection, protected history and restoration', async () => {
  const sql = database();
  const before = await route.GET(request('GET')); const original = await before.json();
  assert.equal(before.headers.get('X-Content-Revision'), '0');
  assert.match(original.heroNote, /custom wording/);
  assert.equal((await route.PATCH(request('PATCH', { revision: 0, changes: { phone: '123' } }, false))).status, 401);
  const responses = await Promise.all([route.PATCH(request('PATCH', { revision: 0, changes: { paymentDetails: 'Updated billing' } })), route.PATCH(request('PATCH', { revision: 0, changes: { heroTitle: 'Stale draft' } }))]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
  const after = await (await route.GET(request('GET'))).json();
  assert.equal(after.heroTitle, original.heroTitle); assert.equal(after.paymentDetails, 'Updated billing');
  assert.equal((await route.PUT(request('PUT', original))).status, 428);
  assert.equal((await route.GET(request('GET', null, false, '?history=1'))).status, 401);
  const history = await (await route.GET(request('GET', null, true, '?history=1'))).json();
  assert.equal(history.length, 2); assert.deepEqual(history.map(x => x.revision), [1, 0]);
  assert.equal(history[1].content.heroTitle, original.heroTitle);
  const restored = await route.PATCH(request('PATCH', { revision: 1, changes: changedFields(after, history[1].content) }));
  assert.equal(restored.status, 200); assert.equal(restored.headers.get('X-Content-Revision'), '2');
  assert.equal((await restored.json()).paymentDetails, original.paymentDetails);
  assert.equal(sql.prepare('SELECT count(*) AS count FROM content_history').get().count, 3);
  assert.equal((await route.PATCH(request('PATCH', { revision: 2, changes: { phone: null } }))).status, 400);
  assert.equal((await route.PATCH(request('PATCH', { revision: 2, changes: { unknown: 'bad' } }))).status, 400);
  sql.close();
});
test('all editor text, links, service descriptions and saved order reach the rendered page', () => {
  const content = normalizeContent({});
  for (const key of Object.keys(defaultContent)) if (typeof content[key] === 'string') content[key] = `saved-${key}`;
  content.phone = '999-222-1111'; content.bookingUrl = 'https://example.test/booking'; content.paymentUrl = 'https://example.test/payment';
  content.services = content.services.map((service, i) => ({ ...service, title: `Saved title ${i}`, detail: `Saved detail ${i}` })).reverse();
  content.layoutOrder = { sections: [...content.layoutOrder.sections].reverse(), specialties: [...content.layoutOrder.specialties].reverse(), schrothGuide: [...content.layoutOrder.schrothGuide].reverse() };
  const html = renderToStaticMarkup(React.createElement(SitePage, { content }));
  for (const [key, value] of Object.entries(content)) if (typeof value === 'string') assert.ok(html.includes(value), `Saved ${key} was not rendered`);
  for (const service of content.services) { assert.ok(html.includes(service.title)); assert.ok(html.includes(service.detail)); }
  assert.ok(html.indexOf('id="insurance"') < html.indexOf('id="payments"'));
  assert.ok(html.indexOf('saved-schrothExpect') < html.indexOf('saved-schrothBring'));
  assert.ok(html.indexOf('Saved title 3') < html.indexOf('Saved title 0'));
  assert.ok(html.includes('href="#schroth-details"'), 'Renamed service keeps its specialty link');
});
