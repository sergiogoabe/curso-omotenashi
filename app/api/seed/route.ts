import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { seedContent } from "@/lib/seed-data"

export const dynamic = "force-dynamic"

export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Seed desabilitado em produção" }, { status: 403 })
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const adminExists = await prisma.user.findUnique({ where: { email: "admin@omotenashi.com" } })
    if (!adminExists) {
      if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Senha administrativa não configurada" }, { status: 503 })
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
      const admin = await prisma.user.create({
        data: { name: "Admin", email: "admin@omotenashi.com", password: hashedPassword, role: "admin" },
      })
      await prisma.enrollment.upsert({
        where: { id: `admin-enrollment-${admin.id}` },
        create: { userId: admin.id, plan: "individual", active: true },
        update: {},
      })
    } else {
      const existingEnroll = await prisma.enrollment.findFirst({ where: { userId: adminExists.id, active: true } })
      if (!existingEnroll) {
        await prisma.enrollment.create({ data: { userId: adminExists.id, plan: "individual", active: true } })
      }
    }

    const { categories, lessons, chapters } = seedContent()

    for (const cat of categories) {
      const exists = await prisma.category.findUnique({ where: { slug: cat.slug } })
      if (!exists) await prisma.category.create({ data: cat })
    }


    for (const lesson of lessons) {
      const category = await prisma.category.findUnique({ where: { slug: lesson.categorySlug } })
      if (category) {
        await prisma.lesson.upsert({
          where: { slug: lesson.slug },
          create: {
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order,
            categoryId: category.id,
          },
          update: {
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order,
            categoryId: category.id,
          },
        })
      }
    }

    for (const chapter of chapters) {
      const exists = await prisma.ebookChapter.findUnique({ where: { slug: chapter.slug } })
      if (!exists) {
        await prisma.ebookChapter.create({ data: chapter })
      }
    }

    const companyExists = await prisma.company.findUnique({ where: { email: "empresa@exemplo.com" } })
    if (!companyExists) {
      const company = await prisma.company.create({
        data: {
          name: "Grupo Alpha Hospitality",
          email: "empresa@exemplo.com",
          phone: "(11) 99999-8888",
          cnpj: "12.345.678/0001-90",
          plan: "business",
          active: true,
        },
      })

      const demoUsers = [
        { name: "Carlos Santos", email: "carlos@exemplo.com", password: "123456", phone: "(11) 98888-7777" },
        { name: "Ana Oliveira", email: "ana@exemplo.com", password: "123456", phone: "(11) 97777-6666" },
        { name: "Pedro Costa", email: "pedro@exemplo.com", password: "123456", phone: "(11) 96666-5555" },
      ]

      for (const u of demoUsers) {
        const exists = await prisma.user.findUnique({ where: { email: u.email } })
        if (!exists) {
          const hash = await bcrypt.hash(u.password, 12)
          const user = await prisma.user.create({
            data: { name: u.name, email: u.email, password: hash, phone: u.phone, companyId: company.id },
          })
          await prisma.enrollment.create({ data: { userId: user.id, plan: "empresarial50", active: true } })
        }
      }
    }

    return NextResponse.json({ message: "Seed concluído com sucesso!" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao popular banco" }, { status: 500 })
  }
}
