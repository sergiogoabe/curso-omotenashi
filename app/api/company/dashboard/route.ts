import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "auth" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { company: true },
  })
  if (!user?.companyId || !user.company) {
    return NextResponse.json({ error: "Você não está vinculado a nenhuma empresa" }, { status: 403 })
  }

  const totalLessons = await prisma.lesson.count()

  const employees = await prisma.user.findMany({
    where: { companyId: user.companyId },
    include: {
      progress: { include: { lesson: { select: { title: true, slug: true } } } },
      enrollments: true,
    },
    orderBy: { name: "asc" },
  })

  const report = employees.map(emp => {
    const completed = emp.progress.filter(p => p.completed).length
    const inProgress = emp.progress.filter(p => !p.completed).length
    return {
      id: emp.id,
      name: emp.name || "Sem nome",
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      completedLessons: completed,
      inProgressLessons: inProgress,
      totalLessons,
      progressPercent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
      enrolled: emp.enrollments.some(e => e.active),
      recentActivity: emp.progress.slice(-5).reverse().map(p => ({
        lessonTitle: p.lesson?.title,
        completed: p.completed,
        date: p.updatedAt,
      })),
    }
  })

  const companyStats = {
    companyName: user.company.name,
    companyEmail: user.company.email,
    companyPlan: user.company.plan,
    totalEmployees: employees.length,
    enrolledEmployees: employees.filter(e => e.enrollments.some(e => e.active)).length,
    avgProgress: employees.length > 0
      ? Math.round(employees.reduce((sum, e) => {
          const c = e.progress.filter(p => p.completed).length
          return sum + (totalLessons > 0 ? (c / totalLessons) * 100 : 0)
        }, 0) / employees.length)
      : 0,
    employees: report,
  }

  return NextResponse.json(companyStats)
}
