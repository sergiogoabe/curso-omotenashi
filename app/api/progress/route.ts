import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasCourseAccess } from "@/lib/course-access"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ progress: [] })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ progress: [] })

  const { searchParams } = new URL(req.url)
  const lessonId = searchParams.get("lessonId")

  if (lessonId) {
    const p = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } },
    })
    return NextResponse.json({ completed: p?.completed || false, lastAccessedAt: p?.lastAccessedAt || null })
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
  })
  return NextResponse.json({ progress })
}

export async function POST(req: Request) {
  if (!(await hasCourseAccess())) return NextResponse.json({ error: "Matrícula ativa necessária" }, { status: 403 })
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const { lessonId, completed, trackView } = await req.json()

  if (trackView) {
    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: { lastAccessedAt: new Date() },
      create: { userId: user.id, lessonId, completed: false, lastAccessedAt: new Date() },
    })
    return NextResponse.json(progress)
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completed, lastAccessedAt: new Date() },
    create: { userId: user.id, lessonId, completed, lastAccessedAt: new Date() },
  })

  return NextResponse.json(progress)
}
