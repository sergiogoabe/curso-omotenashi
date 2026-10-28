import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const topics = await prisma.forumTopic.findMany({
    take: 200,
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
      lesson: { select: { id: true, title: true } },
      _count: { select: { posts: true } },
    },
  })

  return NextResponse.json({ topics })
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = z.object({
    id: z.string().min(1),
    pinned: z.boolean().optional(),
    resolved: z.boolean().optional(),
  }).refine((value) => value.pinned !== undefined || value.resolved !== undefined, "Nada para atualizar").safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })

  try {
    const topic = await prisma.forumTopic.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.pinned !== undefined ? { pinned: parsed.data.pinned } : {}),
        ...(parsed.data.resolved !== undefined ? { resolved: parsed.data.resolved } : {}),
      },
    })
    return NextResponse.json(topic)
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
    await prisma.forumTopic.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
