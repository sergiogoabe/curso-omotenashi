import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"
import { mapCompanyEmployees } from "@/lib/company-report"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, context: RouteContext) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await context.params

  try {
    const [company, totalLessons] = await Promise.all([
      prisma.company.findUnique({
        where: { id },
        include: {
          users: {
            include: {
              progress: { select: { completed: true } },
              enrollments: { where: { active: true }, select: { active: true } },
            },
            orderBy: { name: "asc" },
          },
        },
      }),
      prisma.lesson.count(),
    ])

    if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })

    const employees = mapCompanyEmployees(company.users, totalLessons)
    const avgProgress = employees.length
      ? Math.round(employees.reduce((sum, row) => sum + row.progressPercent, 0) / employees.length)
      : 0

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        cnpj: company.cnpj,
        plan: company.plan,
        active: company.active,
        createdAt: company.createdAt,
        totalUsers: employees.length,
        avgProgress,
      },
      employees,
      totalLessons,
    })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
