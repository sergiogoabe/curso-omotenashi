import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")

  if (slug) {
    const chapter = await prisma.ebookChapter.findUnique({
      where: { slug },
    })
    return NextResponse.json(chapter || { error: "not found" })
  }

  const chapters = await prisma.ebookChapter.findMany({
    orderBy: { order: "asc" },
  })

  return NextResponse.json(chapters)
}
