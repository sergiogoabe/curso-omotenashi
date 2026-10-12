import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasCourseAccess } from "@/lib/course-access"

export async function GET(req: Request) {
  if (!(await hasCourseAccess())) return NextResponse.json({ error: "Matrícula ativa necessária" }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get("topicId")

  if (!topicId) {
    return NextResponse.json({ error: "topicId é obrigatório" }, { status: 400 })
  }

  const posts = await prisma.forumPost.findMany({
    where: { topicId },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  if (!(await hasCourseAccess())) return NextResponse.json({ error: "Matrícula ativa necessária" }, { status: 403 })
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const { topicId, content } = await req.json()

  if (!topicId || !content) {
    return NextResponse.json({ error: "topicId e conteúdo são obrigatórios" }, { status: 400 })
  }

  const topic = await prisma.forumTopic.findUnique({ where: { id: topicId } })
  if (!topic) {
    return NextResponse.json({ error: "Tópico não encontrado" }, { status: 404 })
  }

  const post = await prisma.forumPost.create({
    data: { topicId, content, userId: user.id },
    include: { user: { select: { name: true, image: true } } },
  })

  await prisma.forumTopic.update({
    where: { id: topicId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(post)
}
