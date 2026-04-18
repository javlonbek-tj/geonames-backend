ALTER TABLE "citizen_otps" ADD COLUMN IF NOT EXISTS "telegram_id" varchar(50);
ALTER TABLE "citizen_otps" ALTER COLUMN "phone" DROP NOT NULL;
