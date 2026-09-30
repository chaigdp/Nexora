ALTER TABLE `tasks` ADD `priority` text DEFAULT 'Normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `dependency` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `blocked` integer DEFAULT 0 NOT NULL;