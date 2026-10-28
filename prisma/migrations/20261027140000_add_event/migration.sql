-- Turmas in-company, workshops, consultorias e entregas de selo.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Event'
  ) THEN
    CREATE TABLE "Event" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "type" TEXT NOT NULL DEFAULT 'in-company',
      "location" TEXT,
      "startsAt" TIMESTAMP(3) NOT NULL,
      "endsAt" TIMESTAMP(3),
      "capacity" INTEGER,
      "status" TEXT NOT NULL DEFAULT 'scheduled',
      "companyId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");
    CREATE INDEX "Event_companyId_idx" ON "Event"("companyId");

    ALTER TABLE "Event"
      ADD CONSTRAINT "Event_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
