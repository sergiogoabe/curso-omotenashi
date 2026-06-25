import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const [users, lessons, chapters, enrollments] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.ebookChapter.count(),
    prisma.enrollment.count(),
  ])

  return NextResponse.json({ users, lessons, chapters, enrollments })
}
