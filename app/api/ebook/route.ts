import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hasCourseAccess } from "@/lib/course-access"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")

  if (slug) {
    if (!(await hasCourseAccess())) return NextResponse.json({ error: "Matrícula ativa necessária" }, { status: 403 })
    const chapter = await prisma.ebookChapter.findUnique({
      where: { slug },
    })
    return NextResponse.json(chapter || { error: "not found" })
  }

  const chapters = await prisma.ebookChapter.findMany({
    select: { id: true, title: true, slug: true, order: true },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(chapters)
}
