import { env } from "cloudflare:workers";
import { defaultContent, normalizeContent } from "../../../lib/site-content";
import { applyChanges } from "../../../lib/content-edits";

type SiteEnv = { DB?: D1Database; ADMIN_PASSWORD?: string };
const contentKey = "public-site";
const json = (value: unknown, status = 200, revision?: number) => Response.json(value, {
  status, headers: { "Cache-Control": "no-store", ...(revision !== undefined ? { "X-Content-Revision": String(revision) } : {}) },
});
function authorized(request: Request) {
  const password = (env as unknown as SiteEnv).ADMIN_PASSWORD;
  return !!password && request.headers.get("x-dgpt-admin-password") === password;
}
async function readContent(db: D1Database) {
  const row = await db.prepare("SELECT value, revision FROM site_content WHERE key = ?").bind(contentKey).first<{ value: string; revision: number }>();
  return { content: row ? normalizeContent(JSON.parse(row.value)) : defaultContent, revision: row?.revision ?? 0 };
}
export async function GET(request: Request) {
  const db = (env as unknown as SiteEnv).DB;
  if (!db) return json({ error: "Content storage is unavailable." }, 503);
  try {
    const url = new URL(request.url);
    if (url.searchParams.has("history")) {
      if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
      const before = Number(url.searchParams.get("before") || Number.MAX_SAFE_INTEGER);
      if (!Number.isSafeInteger(before) || before < 1) return json({ error: "Invalid history cursor." }, 400);
      const rows = await db.prepare("SELECT id, revision, value, saved_at FROM content_history WHERE id < ? ORDER BY id DESC LIMIT 50").bind(before).all<{ id: number; revision: number; value: string; saved_at: string }>();
      return json(rows.results.map(row => ({ id: row.id, revision: row.revision, savedAt: row.saved_at, content: normalizeContent(JSON.parse(row.value)) })));
    }
    const { content, revision } = await readContent(db);
    return json(content, 200, revision);
  } catch { return json({ error: "Content could not be loaded. Please try again." }, 503); }
}
export async function PATCH(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
  const db = (env as unknown as SiteEnv).DB;
  if (!db) return json({ error: "Content storage is unavailable." }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  if (!Number.isSafeInteger(input?.revision) || input.revision < 0) return json({ error: "Reload the editor before saving." }, 428);
  try {
    const current = await readContent(db);
    if (current.revision !== input.revision) return json({ error: "Someone saved newer changes. Your draft is preserved; review the latest version before saving." }, 409);
    let content;
    try { content = applyChanges(current.content, input.changes); } catch (error) { return json({ error: error instanceof Error ? error.message : "Invalid changes." }, 400); }
    if (JSON.stringify(content) === JSON.stringify(current.content)) return json(current.content, 200, current.revision);
    // The conditional write is atomic. History triggers run in this same transaction.
    const result = await db.prepare("INSERT INTO site_content (key, value, revision, updated_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, revision = site_content.revision + 1, updated_at = CURRENT_TIMESTAMP WHERE site_content.revision = ?")
      .bind(contentKey, JSON.stringify(content), input.revision).run();
    if (!result.meta.changes) return json({ error: "Someone saved newer changes. Your draft is preserved; review the latest version before saving." }, 409);
    return json(content, 200, current.revision + 1);
  } catch { return json({ error: "Save could not be confirmed. Reload the latest version before retrying." }, 503); }
}
// Older open editor tabs must not overwrite newer content with full-document saves.
export async function PUT() { return json({ error: "This editor is out of date. Reload before saving." }, 428); }
