import { defaultContent, normalizeContent, normalizeOrder, SiteContent } from "./site-content";

export function changedFields(before: SiteContent, after: SiteContent): Partial<SiteContent> {
  return Object.fromEntries(Object.keys(defaultContent).filter(key => JSON.stringify(before[key as keyof SiteContent]) !== JSON.stringify(after[key as keyof SiteContent])).map(key => [key, after[key as keyof SiteContent]]));
}

export function applyChanges(current: SiteContent, changes: unknown): SiteContent {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new Error("Changes must be an object.");
  for (const [key, value] of Object.entries(changes)) {
    if (!Object.hasOwn(defaultContent, key)) throw new Error(`Unknown field: ${key}`);
    if (key === "services") {
      if (!Array.isArray(value) || !value.length || value.some(item => !item || typeof item !== "object" || ["number", "title", "detail"].some(field => typeof item[field] !== "string")) || new Set(value.map(item => item.number)).size !== value.length) throw new Error("Services must have unique identifiers and text fields.");
    } else if (key === "layoutOrder") {
      if (JSON.stringify(normalizeOrder(value)) !== JSON.stringify(value)) throw new Error("Invalid section order.");
    } else if (typeof value !== "string") throw new Error(`Invalid text for ${key}`);
  }
  return normalizeContent({ ...current, ...changes });
}
