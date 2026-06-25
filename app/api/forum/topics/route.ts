import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lessonSlug = searchParams.get("lesson")
  const lessonId = searchParams.get("lessonId")

  const where: any = {}
  if (lessonSlug) {
    const lesson = await prisma.lesson.findUnique({ where: { slug: lessonSlug } })
    if (lesson) where.lessonId = lesson.id
  }
  if (lessonId) where.lessonId = lessonId

  const topics = await prisma.forumTopic.findMany({
    where,
    include: {
      user: { select: { name: true, image: true } },
      posts: { select: { id: true } },
      lesson: { select: { title: true, slug: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  })

  const topicsWithCount = topics.map((t) => ({
    ...t,
    postCount: t.posts.length,
  }))

  return NextResponse.json(topicsWithCount)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const { title, content, lessonId } = await req.json()

  if (!title || !content) {
    return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 })
  }

  const topic = await prisma.forumTopic.create({
    data: {
      title,
      content,
      lessonId: lessonId || null,
      userId: user.id,
    },
    include: {
      user: { select: { name: true, image: true } },
      lesson: { select: { title: true, slug: true } },
    },
  })

  return NextResponse.json(topic)
}
