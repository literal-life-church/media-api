CREATE TABLE `live_events` (
	`id` integer PRIMARY KEY DEFAULT 1,
	`video_id` text DEFAULT '' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`cancellation_reason` text DEFAULT '' NOT NULL,
	`time_of_event` text DEFAULT '' NOT NULL
);
