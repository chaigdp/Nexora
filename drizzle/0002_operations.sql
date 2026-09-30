ALTER TABLE projects ADD COLUMN metadata TEXT NOT NULL DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE tasks ADD COLUMN detail TEXT NOT NULL DEFAULT '{}';
--> statement-breakpoint
CREATE TABLE operations(id TEXT PRIMARY KEY NOT NULL,workspace TEXT NOT NULL,project TEXT NOT NULL,kind TEXT NOT NULL,title TEXT NOT NULL,owner TEXT NOT NULL,due TEXT NOT NULL,status TEXT NOT NULL,priority TEXT NOT NULL,detail TEXT NOT NULL,evidence TEXT NOT NULL,strategy TEXT NOT NULL,dependency TEXT NOT NULL,progress INTEGER NOT NULL DEFAULT 0,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX operations_workspace ON operations(workspace,project);
--> statement-breakpoint
CREATE TABLE integration_jobs(id TEXT PRIMARY KEY NOT NULL,workspace TEXT NOT NULL,project TEXT NOT NULL,status TEXT NOT NULL,payload TEXT NOT NULL,created TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX jobs_workspace ON integration_jobs(workspace);
--> statement-breakpoint
CREATE UNIQUE INDEX projects_crm_identity ON projects(workspace,json_extract(metadata,'$.crm'),json_extract(metadata,'$.externalId')) WHERE json_extract(metadata,'$.externalId') IS NOT NULL AND json_extract(metadata,'$.externalId') != '';
