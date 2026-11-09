import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPlanValue, isPlanId } from "@/lib/plans"
import { publicError } from "@/lib/admin"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const enrollments = await prisma.enrollment.findMany({
    include: { user: { select: { id: true, name: true, email: true, companyId: true, company: true } } },
    orderBy: { createdAt: "desc" },
  })
  const stats = {
    total: enrollments.length,
    individual: enrollments.filter((e: any) => e.plan === "individual").length,
    business: enrollments.filter((e: any) => e.plan !== "individual").length,
    active: enrollments.filter((e: any) => e.active).length,
    revenue: enrollments.reduce((sum: number, e: any) => sum + getPlanValue(e.plan), 0),
  }

  return NextResponse.json({ enrollments, stats })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const parsed = z.object({
    userId: z.string().min(1),
    plan: z.string().min(1).max(64).optional(),
    active: z.boolean().optional(),
    expiresAt: z.string().nullable().optional(),
  }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  if (parsed.data.plan && !isPlanId(parsed.data.plan)) return NextResponse.json({ error: "Plano inválido" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true } })
  if (!user) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

  const plan = parsed.data.plan || "individual"
  const active = parsed.data.active ?? true
  try {
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        plan,
        active,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    })
    if (active) {
      await prisma.user.update({
        where: { id: user.id },
        data: { courseAccess: true, plan, coursePlan: plan },
      })
    }
    return NextResponse.json(enrollment)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const parsed = z.object({
    id: z.string().min(1),
    active: z.boolean().optional(),
    plan: z.string().min(1).max(64).optional(),
    expiresAt: z.string().nullable().optional(),
  }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  if (parsed.data.plan && !isPlanId(parsed.data.plan)) return NextResponse.json({ error: "Plano inválido" }, { status: 400 })

  const existing = await prisma.enrollment.findUnique({ where: { id: parsed.data.id } })
  if (!existing) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 })

  let expiresAt: Date | null | undefined
  if (parsed.data.expiresAt === null) expiresAt = null
  else if (typeof parsed.data.expiresAt === "string") {
    expiresAt = new Date(parsed.data.expiresAt)
    if (Number.isNaN(expiresAt.getTime())) return NextResponse.json({ error: "Data inválida" }, { status: 400 })
  }

  const updated = await prisma.enrollment.update({
    where: { id: existing.id },
    data: {
      ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
      ...(parsed.data.plan ? { plan: parsed.data.plan } : {}),
      ...(expiresAt !== undefined ? { expiresAt } : {}),
    },
  })

  const stillActive = await prisma.enrollment.findFirst({
    where: { userId: existing.userId, active: true },
    select: { plan: true },
    orderBy: { createdAt: "desc" },
  })
  await prisma.user.update({
    where: { id: existing.userId },
    data: {
      courseAccess: Boolean(stillActive),
      ...(stillActive ? { plan: stillActive.plan, coursePlan: stillActive.plan } : {}),
    },
  })

  return NextResponse.json(updated)
}
