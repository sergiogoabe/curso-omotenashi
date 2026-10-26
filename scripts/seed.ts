/**
 * Popula o banco apontado por DATABASE_URL com o conteúdo do curso
 * (categorias, aulas e capítulos do e-book).
 *
 *   node scripts/seed.ts                        # usa o DATABASE_URL do ambiente
 *   node --env-file=.env.production scripts/seed.ts
 *   node scripts/seed.ts --dry-run              # só conta o conteúdo, não grava
 *
 * Idempotente: categorias e capítulos são criados por slug quando não existem,
 * aulas usam upsert por slug. Nenhum usuário é criado — diferente da rota
 * /api/seed, que também cria admin e dados de demonstração (e só roda em dev).
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { seedContent } from "../lib/seed-data.ts"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL não definida. Rode com --env-file=<arquivo>.")
  process.exit(1)
}

const dryRun = process.argv.includes("--dry-run")
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 2 }) })

async function main() {
  const { categories, lessons, chapters } = seedContent()
  console.log(
    `Conteúdo: ${categories.length} categorias, ${lessons.length} aulas, ${chapters.length} capítulos do e-book.`
  )

  if (dryRun) {
    console.log("--dry-run: nada foi gravado.")
    return
  }

  let categoriesCreated = 0
  for (const category of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug }, select: { id: true } })
    if (!existing) {
      await prisma.category.create({ data: category })
      categoriesCreated++
    }
  }

  let lessonsUpserted = 0
  let lessonsSkipped = 0
  for (const lesson of lessons) {
    const category = await prisma.category.findUnique({ where: { slug: lesson.categorySlug }, select: { id: true } })
    if (!category) {
      console.warn(`Categoria ausente para a aula "${lesson.slug}" (${lesson.categorySlug})`)
      lessonsSkipped++
      continue
    }
    const data = {
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      categoryId: category.id,
    }
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      create: { slug: lesson.slug, ...data },
      update: data,
    })
    lessonsUpserted++
  }

  let chaptersCreated = 0
  for (const chapter of chapters) {
    const existing = await prisma.ebookChapter.findUnique({ where: { slug: chapter.slug }, select: { id: true } })
    if (!existing) {
      await prisma.ebookChapter.create({ data: chapter })
      chaptersCreated++
    }
  }

  const [totalCategories, totalLessons, totalChapters] = await Promise.all([
    prisma.category.count(),
    prisma.lesson.count(),
    prisma.ebookChapter.count(),
  ])

  console.log(`Categorias criadas: ${categoriesCreated} (total ${totalCategories})`)
  console.log(`Aulas gravadas: ${lessonsUpserted} (total ${totalLessons})`)
  if (lessonsSkipped) console.log(`Aulas ignoradas por categoria ausente: ${lessonsSkipped}`)
  console.log(`Capítulos criados: ${chaptersCreated} (total ${totalChapters})`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Falha no seed:", error)
    await prisma.$disconnect()
    process.exit(1)
  })
