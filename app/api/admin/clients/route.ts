import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"
import { syncCourseAccess } from "@/lib/access"
import { isPlanId } from "@/lib/plans"

export const dynamic = "force-dynamic"

const clientSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  plan: true,
  courseAccess: true,
  coursePlan: true,
  courseExpiresAt: true,
  companyId: true,
  createdAt: true,
  company: { select: { id: true, name: true } },
  enrollments: {
    select: { id: true, plan: true, active: true, expiresAt: true },
    orderBy: { createdAt: "desc" as const },
  },
  progress: { where: { completed: true }, select: { id: true } },
}

const patchSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().max(160).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  role: z.enum(["student", "admin"]).optional(),
  plan: z.string().trim().min(1).max(64).optional(),
  courseAccess: z.boolean().optional(),
  companyId: z.string().min(1).nullable().optional(),
  courseExpiresAt: z.string().nullable().optional(),
})

function parseExpiry(value: string | null) {
  if (!value) return null
  const date = value.length <= 10 ? new Date(`${value}T12:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error("Data de expiração inválida")
  return date
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const [users, total, companies, lessonCount] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 500, select: clientSelect }),
    prisma.user.count(),
    prisma.company.findMany({ select: { id: true, name: true, active: true }, orderBy: { name: "asc" } }),
    prisma.lesson.count(),
  ])

  return NextResponse.json({ users, total, companies, lessonCount })
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })
  if (parsed.data.plan && !isPlanId(parsed.data.plan)) return NextResponse.json({ error: "Plano inválido" }, { status: 400 })

  try {
    const existing = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, plan: true, companyId: true, courseAccess: true },
    })
    if (!existing) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    const data = parsed.data
    const profile: {
      name?: string | null
      phone?: string | null
      role?: string
      company?: { connect: { id: string } } | { disconnect: true }
    } = {}
    if (data.name !== undefined) profile.name = data.name || null
    if (data.phone !== undefined) profile.phone = data.phone || null
    if (data.role !== undefined) profile.role = data.role
    if (data.companyId !== undefined) {
      if (data.companyId) profile.company = { connect: { id: data.companyId } }
      else if (existing.companyId) profile.company = { disconnect: true }
    }
    if (Object.keys(profile).length) {
      await prisma.user.update({ where: { id: existing.id }, data: profile })
    }

    const nextPlan = data.plan ?? existing.plan
    if (data.courseAccess !== undefined) {
      await syncCourseAccess({
        userId: existing.id,
        plan: nextPlan || "individual",
        active: data.courseAccess,
        ...(data.courseExpiresAt !== undefined ? { expiresAt: parseExpiry(data.courseExpiresAt) } : {}),
      })
      if (!data.courseAccess && data.plan) {
        await prisma.user.update({ where: { id: existing.id }, data: { plan: data.plan } })
      }
    } else if (data.plan !== undefined || data.courseExpiresAt !== undefined) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          ...(data.plan ? { plan: nextPlan, ...(existing.courseAccess ? { coursePlan: nextPlan } : {}) } : {}),
          ...(data.courseExpiresAt !== undefined ? { courseExpiresAt: parseExpiry(data.courseExpiresAt) } : {}),
        },
      })
      if (data.plan) {
        await prisma.enrollment.updateMany({
          where: { userId: existing.id, active: true },
          data: { plan: nextPlan },
        })
      }
    }

    const user = await prisma.user.findUnique({ where: { id: existing.id }, select: clientSelect })
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = z.object({ userId: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  if ((session.user as { id?: string }).id === parsed.data.userId) {
    return NextResponse.json({ error: "Você não pode remover a própria conta" }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: parsed.data.userId } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
