import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"
import { syncCourseAccess } from "@/lib/access"
import { isPaidStatus } from "@/lib/admin-labels"
import { isPlanId } from "@/lib/plans"

export const dynamic = "force-dynamic"

const createSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(200),
  name: z.string().trim().max(160).optional().nullable(),
  plan: z.string().trim().min(1).max(64),
  value: z.number().min(0).max(1_000_000),
  status: z.string().trim().min(1).max(32),
  paymentMethod: z.string().trim().min(1).max(32),
})

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.string().trim().min(1).max(32).optional(),
  plan: z.string().trim().min(1).max(64).optional(),
  value: z.number().min(0).max(1_000_000).optional(),
  paymentMethod: z.string().trim().min(1).max(32).optional(),
  name: z.string().trim().max(160).optional().nullable(),
})

async function findUserId(email: string) {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  })
  return user?.id ?? null
}

async function grantIfPaid(userId: string | null, plan: string, status: string) {
  if (!userId || !isPaidStatus(status)) return
  await syncCourseAccess({
    userId,
    plan: plan || "individual",
    active: true,
  })
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      take: 300,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.payment.count(),
  ])

  return NextResponse.json({ payments, total })
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })
  if (!isPlanId(parsed.data.plan)) return NextResponse.json({ error: "Plano inválido" }, { status: 400 })

  try {
    const email = parsed.data.email.toLowerCase()
    const userId = await findUserId(email)
    const payment = await prisma.payment.create({
      data: {
        email,
        name: parsed.data.name || null,
        plan: parsed.data.plan,
        value: parsed.data.value,
        status: parsed.data.status,
        paymentMethod: parsed.data.paymentMethod,
        userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    await grantIfPaid(userId, payment.plan, payment.status)
    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })
  if (parsed.data.plan && !isPlanId(parsed.data.plan)) return NextResponse.json({ error: "Plano inválido" }, { status: 400 })

  try {
    const existing = await prisma.payment.findUnique({ where: { id: parsed.data.id } })
    if (!existing) return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 })

    const email = existing.email
    const userId = existing.userId ?? await findUserId(email)
    const payment = await prisma.payment.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.plan ? { plan: parsed.data.plan } : {}),
        ...(parsed.data.value !== undefined ? { value: parsed.data.value } : {}),
        ...(parsed.data.paymentMethod ? { paymentMethod: parsed.data.paymentMethod } : {}),
        ...(parsed.data.name !== undefined ? { name: parsed.data.name || null } : {}),
        ...(userId ? { userId } : {}),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    await grantIfPaid(payment.userId, payment.plan, payment.status)
    return NextResponse.json(payment)
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
    await prisma.payment.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
