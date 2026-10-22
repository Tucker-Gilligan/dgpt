import { sql } from "drizzle-orm";
import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const siteContent = sqliteTable("site_content", {
  revision: integer("revision").notNull().default(0),
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contentHistory = sqliteTable("content_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  revision: integer("revision").notNull(),
  value: text("value").notNull(),
  savedAt: text("saved_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
