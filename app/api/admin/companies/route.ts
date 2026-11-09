import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { publicError } from "@/lib/admin"

// Allowlist: never spread a raw request body into prisma.company.update.
const companyUpdateSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().max(200).optional(),
    phone: z.string().max(40).optional().nullable(),
    cnpj: z.string().max(32).optional().nullable(),
    plan: z.string().max(64).optional(),
    active: z.boolean().optional(),
  })
  .strict()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const [companies, lessonCount] = await Promise.all([
    prisma.company.findMany({
      include: {
        _count: { select: { users: true } },
        users: { include: { progress: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lesson.count(),
  ])

  const report = companies.map((c: any) => {
    const totalUsers = c.users.length
    const totalLessons = Math.max(lessonCount, 1)
    const completedMap = c.users.reduce((acc: Record<string, number>, u: any) => {
      acc[u.id] = u.progress.filter((p: any) => p.completed).length
      return acc
    }, {} as Record<string, number>)
    const avgProgress = totalUsers > 0
      ? Object.values(completedMap).reduce((a: number, b: any) => a + (b as number), 0) / totalUsers / totalLessons * 100
      : 0
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      cnpj: c.cnpj,
      plan: c.plan,
      active: c.active,
      totalUsers,
      avgProgress: Math.round(avgProgress),
      createdAt: c.createdAt,
    }
  })

  return NextResponse.json({ companies: report })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const parsed = z.object({
    name: z.string().trim().min(2).max(200),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).nullable().optional(),
    cnpj: z.string().trim().max(32).nullable().optional(),
    plan: z.string().trim().max(64).optional(),
  }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  try {
    const company = await prisma.company.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone || null,
        cnpj: parsed.data.cnpj || null,
        plan: parsed.data.plan || "business",
        active: true,
      },
    })
    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const parsed = companyUpdateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "dados inválidos" }, { status: 400 })
  const { id, ...data } = parsed.data
  try {
    const updated = await prisma.company.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  try {
    await prisma.company.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ message: "Empresa removida" })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
