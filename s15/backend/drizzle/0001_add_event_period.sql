CREATE TYPE "public"."event_period" AS ENUM('1H', '2H', 'ET', 'PEN');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "period" "event_period" DEFAULT '1H' NOT NULL;
