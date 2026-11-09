import { randomUUID } from "node:crypto"
import { prisma } from "@/lib/prisma"

export type EventInput = {
  title: string
  description: string | null
  type: string
  location: string | null
  startsAt: Date
  endsAt: Date | null
  capacity: number | null
  status: string
  companyId: string | null
}

export type EventRecord = EventInput & {
  id: string
  company: { id: string; name: string } | null
}

type EventRow = {
  id: string
  title: string
  description: string | null
  type: string
  location: string | null
  startsAt: Date
  endsAt: Date | null
  capacity: number | null
  status: string
  companyId: string | null
  companyName: string | null
}

let ready: Promise<void> | null = null

export function ensureEventsTable() {
  if (!ready) {
    ready = createEventsTable().catch((error) => {
      ready = null
      throw error
    })
  }
  return ready
}

async function createEventsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Event" (
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
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
    )
  `)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Event_startsAt_idx" ON "Event"("startsAt")`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Event_companyId_idx" ON "Event"("companyId")`)
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Event_companyId_fkey') THEN
        ALTER TABLE "Event"
          ADD CONSTRAINT "Event_companyId_fkey"
          FOREIGN KEY ("companyId") REFERENCES "Company"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$
  `)
}

function mapEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    location: row.location,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    capacity: row.capacity,
    status: row.status,
    companyId: row.companyId,
    company: row.companyId && row.companyName ? { id: row.companyId, name: row.companyName } : null,
  }
}

const eventSelect = `
  SELECT e.id, e.title, e.description, e.type, e.location, e."startsAt", e."endsAt",
         e.capacity, e.status, e."companyId", c.name AS "companyName"
  FROM "Event" e
  LEFT JOIN "Company" c ON c.id = e."companyId"
`

export async function listEvents() {
  await ensureEventsTable()
  const rows = await prisma.$queryRawUnsafe(`${eventSelect} ORDER BY e."startsAt" DESC`) as EventRow[]
  return rows.map(mapEvent)
}

export async function upcomingEvents() {
  await ensureEventsTable()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const now = new Date()
  const [rows, counts] = await Promise.all([
    prisma.$queryRaw<EventRow[]>`
      SELECT e.id, e.title, e.description, e.type, e.location, e."startsAt", e."endsAt",
             e.capacity, e.status, e."companyId", c.name AS "companyName"
      FROM "Event" e
      LEFT JOIN "Company" c ON c.id = e."companyId"
      WHERE e.status <> 'cancelled' AND e."startsAt" >= ${since}
      ORDER BY e."startsAt" ASC
      LIMIT 5
    `,
    prisma.$queryRaw<Array<{ count: number | bigint }>>`
      SELECT COUNT(*)::int AS count
      FROM "Event"
      WHERE status IN ('scheduled', 'confirmed') AND "startsAt" >= ${now}
    `,
  ])
  const count = counts[0]?.count ?? 0
  return {
    upcoming: rows.map(mapEvent),
    upcomingCount: typeof count === "bigint" ? Number(count) : Number(count),
  }
}

async function findEvent(id: string) {
  const rows = await prisma.$queryRaw<EventRow[]>`
    SELECT e.id, e.title, e.description, e.type, e.location, e."startsAt", e."endsAt",
           e.capacity, e.status, e."companyId", c.name AS "companyName"
    FROM "Event" e
    LEFT JOIN "Company" c ON c.id = e."companyId"
    WHERE e.id = ${id}
    LIMIT 1
  `
  return rows[0] ? mapEvent(rows[0]) : null
}

export async function createEvent(input: EventInput) {
  await ensureEventsTable()
  const id = randomUUID()
  await prisma.$executeRaw`
    INSERT INTO "Event"
      (id, title, description, type, location, "startsAt", "endsAt", capacity, status, "companyId", "createdAt", "updatedAt")
    VALUES
      (${id}, ${input.title}, ${input.description}, ${input.type}, ${input.location}, ${input.startsAt}, ${input.endsAt}, ${input.capacity}, ${input.status}, ${input.companyId}, NOW(), NOW())
  `
  const event = await findEvent(id)
  if (!event) throw new Error("Não foi possível salvar o evento")
  return event
}

export async function updateEvent(id: string, input: EventInput) {
  await ensureEventsTable()
  const updated = await prisma.$executeRaw`
    UPDATE "Event"
    SET title = ${input.title},
        description = ${input.description},
        type = ${input.type},
        location = ${input.location},
        "startsAt" = ${input.startsAt},
        "endsAt" = ${input.endsAt},
        capacity = ${input.capacity},
        status = ${input.status},
        "companyId" = ${input.companyId},
        "updatedAt" = NOW()
    WHERE id = ${id}
  `
  if (updated === 0) throw new Error("Registro não encontrado")
  const event = await findEvent(id)
  if (!event) throw new Error("Registro não encontrado")
  return event
}

export async function deleteEvent(id: string) {
  await ensureEventsTable()
  const removed = await prisma.$executeRaw`DELETE FROM "Event" WHERE id = ${id}`
  if (removed === 0) throw new Error("Registro não encontrado")
}
