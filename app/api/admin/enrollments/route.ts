import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const enrollments = await prisma.enrollment.findMany({
    include: { user: { select: { id: true, name: true, email: true, companyId: true, company: true } } },
    orderBy: { createdAt: "desc" },
  })
  const stats = {
    total: enrollments.length,
    individual: enrollments.filter(e => e.plan === "individual").length,
    business: enrollments.filter(e => e.plan === "business").length,
    active: enrollments.filter(e => e.active).length,
    revenue: enrollments.filter(e => e.plan === "individual").length * 197 +
             enrollments.filter(e => e.plan === "business").length * 2497,
  }

  return NextResponse.json({ enrollments, stats })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const { userId, plan, active, expiresAt } = await req.json()
  const enrollment = await prisma.enrollment.create({
    data: { userId, plan: plan || "individual", active: active ?? true, expiresAt: expiresAt ? new Date(expiresAt) : null },
  })
  return NextResponse.json(enrollment)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "negado" }, { status: 403 })

  const { id, active, plan, expiresAt } = await req.json()
  const updated = await prisma.enrollment.update({
    where: { id },
    data: { active, plan, expiresAt: expiresAt ? new Date(expiresAt) : undefined },
  })
  return NextResponse.json(updated)
}
