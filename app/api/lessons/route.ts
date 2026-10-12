import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hasCourseAccess } from "@/lib/course-access"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")

  if (slug) {
    if (!(await hasCourseAccess())) return NextResponse.json({ error: "Matrícula ativa necessária" }, { status: 403 })
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
      include: { category: true },
    })
    return NextResponse.json(lesson || { error: "not found" })
  }

  const lessons = await prisma.lesson.findMany({
    select: { id: true, title: true, slug: true, description: true, duration: true, order: true, categoryId: true, category: true },
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
  })

  return NextResponse.json(lessons)
}
