import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const [users, lessons, chapters, enrollments] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.ebookChapter.count(),
    prisma.enrollment.count(),
  ])

  return NextResponse.json({ users, lessons, chapters, enrollments })
}
