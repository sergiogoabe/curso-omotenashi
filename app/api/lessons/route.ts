import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")

  if (slug) {
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
      include: { category: true },
    })
    return NextResponse.json(lesson || { error: "not found" })
  }

  const lessons = await prisma.lesson.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
  })

  return NextResponse.json(lessons)
}
