CREATE TABLE `merchant_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`business_name` text DEFAULT 'Your Business' NOT NULL,
	`business_email` text,
	`business_phone` text,
	`business_address` text,
	`tax_id` text,
	`currency` text DEFAULT 'USD' NOT NULL,
	`timezone` text DEFAULT 'America/New_York' NOT NULL,
	`payment_processors` text,
	`notifications` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`items` text NOT NULL,
	`shipping_address` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`type` text DEFAULT 'payment' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`payment_processor` text,
	`processor_transaction_id` text,
	`description` text,
	`metadata` text,
	`processed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
DROP TABLE `samples`;