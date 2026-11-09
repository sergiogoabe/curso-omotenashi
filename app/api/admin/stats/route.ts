import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { isPaidStatus } from "@/lib/admin-labels"
import { upcomingEvents } from "@/lib/events"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const [
    users,
    lessons,
    chapters,
    enrollments,
    activeEnrollments,
    companies,
    associates,
    courseAccess,
    pending,
    forumOpen,
    paymentGroups,
    planGroups,
    recentPayments,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.ebookChapter.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { active: true } }),
    prisma.company.count(),
    prisma.user.count({ where: { companyId: { not: null } } }),
    prisma.user.count({ where: { courseAccess: true } }),
    prisma.pendingRegistration.count(),
    prisma.forumTopic.count({ where: { resolved: false } }),
    prisma.payment.groupBy({ by: ["status"], _sum: { value: true }, _count: true }),
    prisma.enrollment.groupBy({ by: ["plan"], _count: true }),
    prisma.payment.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        courseAccess: true,
        createdAt: true,
        company: { select: { name: true } },
      },
    }),
  ])

  let revenue = 0
  let revenuePending = 0
  let payments = 0
  for (const row of paymentGroups) {
    const value = row._sum?.value ?? 0
    payments += typeof row._count === "number" ? row._count : 0
    if (isPaidStatus(row.status)) revenue += value
    else if (["pending", "overdue"].includes(row.status.toLowerCase())) revenuePending += value
  }

  let eventsUpcoming = 0
  let nextEvents: Awaited<ReturnType<typeof upcomingEvents>>["upcoming"] = []
  try {
    const summary = await upcomingEvents()
    eventsUpcoming = summary.upcomingCount
    nextEvents = summary.upcoming
  } catch {
    eventsUpcoming = 0
    nextEvents = []
  }

  return NextResponse.json({
    users,
    lessons,
    chapters,
    enrollments,
    activeEnrollments,
    companies,
    associates,
    courseAccess,
    pending,
    forumOpen,
    eventsUpcoming,
    revenue,
    revenuePending,
    payments,
    plans: planGroups.map((row: any) => ({ plan: row.plan, count: typeof row._count === "number" ? row._count : 0 })),
    recentPayments,
    recentUsers,
    upcomingEvents: nextEvents,
  })
}
