CREATE TABLE `content_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`revision` integer NOT NULL,
	`value` text NOT NULL,
	`saved_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `site_content` ADD `revision` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TRIGGER content_history_before_update BEFORE UPDATE ON site_content
WHEN OLD.key = 'public-site'
BEGIN
  INSERT INTO content_history (revision, value, saved_at)
  SELECT OLD.revision, OLD.value, OLD.updated_at
  WHERE NOT EXISTS (SELECT 1 FROM content_history WHERE revision = OLD.revision);
END;
--> statement-breakpoint
CREATE TRIGGER content_history_after_update AFTER UPDATE ON site_content
WHEN NEW.key = 'public-site'
BEGIN
  INSERT INTO content_history (revision, value, saved_at) VALUES (NEW.revision, NEW.value, NEW.updated_at);
END;
--> statement-breakpoint
CREATE TRIGGER content_history_after_insert AFTER INSERT ON site_content
WHEN NEW.key = 'public-site'
BEGIN
  INSERT INTO content_history (revision, value, saved_at) VALUES (NEW.revision, NEW.value, NEW.updated_at);
END;
