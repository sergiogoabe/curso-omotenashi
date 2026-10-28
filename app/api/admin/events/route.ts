import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"
import { createEvent, deleteEvent, listEvents, updateEvent } from "@/lib/events"

export const dynamic = "force-dynamic"

const eventSchema = z.object({
  title: z.string().trim().min(2, "Informe o título").max(160),
  description: z.string().trim().max(5000).optional().nullable(),
  type: z.enum(["in-company", "workshop", "webinar", "selo", "consultoria"]),
  location: z.string().trim().max(200).optional().nullable(),
  startsAt: z.string().min(1, "Informe o início"),
  endsAt: z.string().optional().nullable(),
  capacity: z.number().int().positive().max(10000).optional().nullable(),
  status: z.enum(["scheduled", "confirmed", "done", "cancelled"]),
  companyId: z.string().min(1).optional().nullable(),
})

function toEventData(input: z.infer<typeof eventSchema>) {
  const startsAt = new Date(input.startsAt)
  if (Number.isNaN(startsAt.getTime())) throw new Error("Data inicial inválida")
  const endsAt = input.endsAt ? new Date(input.endsAt) : null
  if (input.endsAt && endsAt && Number.isNaN(endsAt.getTime())) throw new Error("Data final inválida")
  if (endsAt && endsAt < startsAt) throw new Error("O término precisa ser depois do início")
  return {
    title: input.title,
    description: input.description || null,
    type: input.type,
    location: input.location || null,
    startsAt,
    endsAt,
    capacity: input.capacity ?? null,
    status: input.status,
    companyId: input.companyId || null,
  }
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const [events, companies] = await Promise.all([
      listEvents(),
      prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ])
    return NextResponse.json({ events, companies })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = eventSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })

  try {
    const event = await createEvent(toEventData(parsed.data))
    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = eventSchema.extend({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })

  try {
    const { id, ...rest } = parsed.data
    const event = await updateEvent(id, toEventData(rest))
    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  try {
    await deleteEvent(parsed.data.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
