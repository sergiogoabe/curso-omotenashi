import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasCourseAccess } from "@/lib/course-access"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "A matrícula é liberada após confirmação do pagamento" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const { plan } = await req.json()

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      plan: plan || "individual",
      active: true,
    },
  })

  return NextResponse.json(enrollment)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ enrollments: [], hasAccess: false })
  }

  const now = new Date()
  const [hasAccess, user] = await Promise.all([
    // Mesmo gate do servidor: admin, matrícula vigente ou liberação manual pela flag.
    hasCourseAccess(),
    prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: "insensitive" } },
      select: { enrollments: { orderBy: { createdAt: "desc" } } },
    }),
  ])
  const enrollments = (user?.enrollments ?? []).filter((e) => e.active && (!e.expiresAt || e.expiresAt > now))
  return NextResponse.json({ enrollments, hasAccess })
}
