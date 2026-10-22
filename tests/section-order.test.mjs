import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/site-content.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { normalizeContent, normalizeOrder, defaultOrder } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("older saved content gains the original layout without changing editor text", () => {
  const content = normalizeContent({ heroTitle: "Dalton's headline", paymentDetails: "Saved billing instructions" });
  assert.deepEqual(content.layoutOrder, defaultOrder);
  assert.equal(content.heroTitle, "Dalton's headline");
  assert.equal(content.paymentDetails, "Saved billing instructions");
});
test("every supported group preserves a reordered layout through saving and loading", () => {
  const layoutOrder = Object.fromEntries(Object.entries(defaultOrder).map(([key, items]) => [key, [...items].reverse()]));
  assert.deepEqual(normalizeContent(JSON.parse(JSON.stringify({ layoutOrder }))).layoutOrder, layoutOrder);
});
test("malformed layouts cannot duplicate or remove sections", () => {
  const result = normalizeOrder({ sections: ["payments", "payments", "unknown", null], specialties: "broken", schrothGuide: [] });
  assert.equal(result.sections[0], "payments");
  assert.equal(result.sections.length, defaultOrder.sections.length);
  assert.deepEqual([...result.sections].sort(), [...defaultOrder.sections].sort());
  assert.deepEqual(result.specialties, defaultOrder.specialties);
  assert.deepEqual(result.schrothGuide, defaultOrder.schrothGuide);
});
