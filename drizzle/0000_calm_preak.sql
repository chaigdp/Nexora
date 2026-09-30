CREATE TABLE `attempts` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`project` text NOT NULL,
	`message` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_workspace` ON `events` (`workspace`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`client` text NOT NULL,
	`segment` text NOT NULL,
	`system` text NOT NULL,
	`owner` text NOT NULL,
	`phase` text NOT NULL,
	`start` text NOT NULL,
	`due` text NOT NULL,
	`completed` text DEFAULT '' NOT NULL,
	`scope` text DEFAULT '' NOT NULL,
	`risk` text DEFAULT 'Baixo' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `projects_workspace` ON `projects` (`workspace`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`name` text NOT NULL,
	`demo` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`project` text NOT NULL,
	`title` text NOT NULL,
	`owner` text NOT NULL,
	`due` text NOT NULL,
	`done` integer DEFAULT 0 NOT NULL,
	`critical` integer DEFAULT 0 NOT NULL,
	`kind` text DEFAULT 'Entrega' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_workspace` ON `tasks` (`workspace`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`salt` text NOT NULL,
	`workspace` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);