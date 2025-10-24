ALTER TABLE "tickets" ADD COLUMN "attachment_urls" text[];--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "attachments";