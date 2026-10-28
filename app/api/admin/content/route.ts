import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"
import { slugify } from "@/lib/slug"

export const dynamic = "force-dynamic"

async function uniqueSlug(base: string, taken: (slug: string) => Promise<boolean>) {
  const root = slugify(base)
  if (!(await taken(root))) return root
  for (let i = 2; i < 100; i++) {
    const next = `${root.slice(0, 70)}-${i}`
    if (!(await taken(next))) return next
  }
  throw new Error("Não foi possível gerar um identificador único")
}

const categorySchema = z.object({
  resource: z.literal("category"),
  name: z.string().trim().min(2).max(120),
  order: z.number().int().min(0).max(9999).optional(),
})

const lessonSchema = z.object({
  resource: z.literal("lesson"),
  title: z.string().trim().min(2).max(200),
  description: z.string().max(20000).optional(),
  content: z.string().max(500000).optional(),
  videoUrl: z.string().trim().max(500).optional().nullable(),
  videoType: z.enum(["youtube", "custom"]).optional(),
  duration: z.string().trim().max(20).optional(),
  order: z.number().int().min(0).max(9999).optional(),
  categoryId: z.string().min(1),
})

const chapterSchema = z.object({
  resource: z.literal("chapter"),
  title: z.string().trim().min(2).max(200),
  content: z.string().max(500000).optional(),
  order: z.number().int().min(0).max(9999).optional(),
})

const createSchema = z.discriminatedUnion("resource", [categorySchema, lessonSchema, chapterSchema])

const patchSchema = z.discriminatedUnion("resource", [
  categorySchema.extend({ id: z.string().min(1) }),
  lessonSchema.extend({ id: z.string().min(1) }),
  chapterSchema.extend({ id: z.string().min(1) }),
])

const deleteSchema = z.object({
  resource: z.enum(["category", "lesson", "chapter"]),
  id: z.string().min(1),
})

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const [categories, lessons, chapters] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { lessons: true } } } }),
    prisma.lesson.findMany({
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.ebookChapter.findMany({ orderBy: { order: "asc" } }),
  ])

  return NextResponse.json({ categories, lessons, chapters })
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })

  try {
    if (parsed.data.resource === "category") {
      const slug = await uniqueSlug(parsed.data.name, async (slug) => Boolean(await prisma.category.findUnique({ where: { slug }, select: { id: true } })))
      const category = await prisma.category.create({ data: { name: parsed.data.name, slug, order: parsed.data.order ?? 0 } })
      return NextResponse.json(category)
    }
    if (parsed.data.resource === "lesson") {
      const slug = await uniqueSlug(parsed.data.title, async (slug) => Boolean(await prisma.lesson.findUnique({ where: { slug }, select: { id: true } })))
      const lesson = await prisma.lesson.create({
        data: {
          title: parsed.data.title,
          slug,
          description: parsed.data.description ?? "",
          content: parsed.data.content ?? "",
          videoUrl: parsed.data.videoUrl || null,
          videoType: parsed.data.videoType ?? "youtube",
          duration: parsed.data.duration || "10:00",
          order: parsed.data.order ?? 0,
          categoryId: parsed.data.categoryId,
        },
      })
      return NextResponse.json(lesson)
    }
    const slug = await uniqueSlug(parsed.data.title, async (slug) => Boolean(await prisma.ebookChapter.findUnique({ where: { slug }, select: { id: true } })))
    const chapter = await prisma.ebookChapter.create({
      data: { title: parsed.data.title, slug, content: parsed.data.content ?? "", order: parsed.data.order ?? 0 },
    })
    return NextResponse.json(chapter)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })

  try {
    if (parsed.data.resource === "category") {
      const category = await prisma.category.update({
        where: { id: parsed.data.id },
        data: { name: parsed.data.name, order: parsed.data.order ?? 0 },
      })
      return NextResponse.json(category)
    }
    if (parsed.data.resource === "lesson") {
      const lesson = await prisma.lesson.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          description: parsed.data.description ?? "",
          content: parsed.data.content ?? "",
          videoUrl: parsed.data.videoUrl || null,
          videoType: parsed.data.videoType ?? "youtube",
          duration: parsed.data.duration || "10:00",
          order: parsed.data.order ?? 0,
          categoryId: parsed.data.categoryId,
        },
      })
      return NextResponse.json(lesson)
    }
    const chapter = await prisma.ebookChapter.update({
      where: { id: parsed.data.id },
      data: { title: parsed.data.title, content: parsed.data.content ?? "", order: parsed.data.order ?? 0 },
    })
    return NextResponse.json(chapter)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  try {
    if (parsed.data.resource === "category") {
      const count = await prisma.lesson.count({ where: { categoryId: parsed.data.id } })
      if (count > 0) return NextResponse.json({ error: "Remova as aulas deste módulo antes de excluí-lo" }, { status: 400 })
      await prisma.category.delete({ where: { id: parsed.data.id } })
    } else if (parsed.data.resource === "lesson") {
      await prisma.lesson.delete({ where: { id: parsed.data.id } })
    } else {
      await prisma.ebookChapter.delete({ where: { id: parsed.data.id } })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
