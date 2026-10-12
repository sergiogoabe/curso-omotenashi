import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { users: true } },
      users: { include: { progress: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const report = companies.map(c => {
    const totalUsers = c.users.length
    const totalLessons = 13
    const completedMap = c.users.reduce((acc, u) => {
      acc[u.id] = u.progress.filter(p => p.completed).length
      return acc
    }, {} as Record<string, number>)
    const avgProgress = totalUsers > 0
      ? Object.values(completedMap).reduce((a, b) => a + b, 0) / totalUsers / totalLessons * 100
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

  const { name, email, phone, cnpj, plan } = await req.json()
  const company = await prisma.company.create({
    data: { name, email, phone, cnpj, plan: plan || "business", active: true },
  })
  return NextResponse.json(company)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const { id, ...data } = await req.json()
  const updated = await prisma.company.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const { id } = await req.json()
  await prisma.company.delete({ where: { id } })
  return NextResponse.json({ message: "Empresa removida" })
}
