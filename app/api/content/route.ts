import { env } from "cloudflare:workers";
import { defaultContent, normalizeContent } from "../../../lib/site-content";

type SiteEnv = { DB?: D1Database; ADMIN_PASSWORD?: string };
const contentKey = "public-site";

async function getStoredContent() {
  const siteEnv = env as unknown as SiteEnv;
  if (!siteEnv.DB) return defaultContent;
  const result = await siteEnv.DB.prepare("SELECT value FROM site_content WHERE key = ?").bind(contentKey).first<{ value: string }>();
  if (!result?.value) return defaultContent;
  try { return normalizeContent(JSON.parse(result.value)); } catch { return defaultContent; }
}

export async function GET() {
  return Response.json(await getStoredContent(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const siteEnv = env as unknown as SiteEnv;
  const password = request.headers.get("x-dgpt-admin-password");
  if (!siteEnv.ADMIN_PASSWORD || password !== siteEnv.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!siteEnv.DB) return Response.json({ error: "Content storage is not configured yet." }, { status: 503 });
  const content = normalizeContent(await request.json());
  await siteEnv.DB.prepare("INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(contentKey, JSON.stringify(content)).run();
  return Response.json(content);
}
