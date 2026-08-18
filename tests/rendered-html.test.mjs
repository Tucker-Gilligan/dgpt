import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Dynamic Gains homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Dynamic Gains Physical Therapy \| Denville, NJ<\/title>/i);
  assert.match(html, /Move better\./);
  assert.match(html, /Feel like yourself\./);
  assert.match(html, /Orthopedic physical therapy/);
  assert.match(html, /TMJ therapy/);
  assert.match(html, /Vestibular rehabilitation/);
  assert.match(html, /Schroth &amp; scoliosis care/);
  assert.match(html, /In-network with Blue Cross Blue Shield/);
  assert.doesNotMatch(html, /Medicare and OON insurance will be accepted/i);
});

test("does not publish the unfinished footer placeholder", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /Logo, email, hours &(?:amp;)? patient links coming soon\./i);

  const [contentSource, adminSource] = await Promise.all([
    readFile(new URL("../lib/site-content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(contentSource, /Logo, email, hours/);
  assert.doesNotMatch(adminSource, /footerNote|Footer note/);
});
