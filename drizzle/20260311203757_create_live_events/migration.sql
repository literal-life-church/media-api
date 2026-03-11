CREATE TABLE `live_events` (
	`id` integer PRIMARY KEY DEFAULT 1,
	`video_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL
);
