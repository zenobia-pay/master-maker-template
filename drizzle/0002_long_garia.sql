CREATE TABLE `user_properties` (
	`user_id` text PRIMARY KEY NOT NULL,
	`lorem` text,
	`ipsum` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
