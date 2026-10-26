-- Alinha o banco com prisma/schema.prisma (sem migration desde a init de 2026-10-14).
-- Aplica colunas de plano/curso/reset no User e asaasId no Payment.
-- Idempotente: só executa se a coluna ainda não existir.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'plan') THEN
    ALTER TABLE "User" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'individual';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'courseAccess') THEN
    ALTER TABLE "User" ADD COLUMN "courseAccess" BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'coursePlan') THEN
    ALTER TABLE "User" ADD COLUMN "coursePlan" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'courseExpiresAt') THEN
    ALTER TABLE "User" ADD COLUMN "courseExpiresAt" TIMESTAMP(3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'resetToken') THEN
    ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'resetTokenExpiresAt') THEN
    ALTER TABLE "User" ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Payment' AND column_name = 'asaasId') THEN
    ALTER TABLE "Payment" ADD COLUMN "asaasId" TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS "Payment_asaasId_key" ON "Payment"("asaasId");
  END IF;
END$$;

COMMIT;
