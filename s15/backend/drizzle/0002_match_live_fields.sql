ALTER TABLE "matches" ADD COLUMN "league" text DEFAULT 'Liga' NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "kickoff_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "minute" integer DEFAULT 0 NOT NULL;
