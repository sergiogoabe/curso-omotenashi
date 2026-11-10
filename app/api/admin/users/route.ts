import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emailEnabled, sendEmail, verifyEmailTemplate } from "@/lib/email"
import { newEmailToken, verifyEmailLink } from "@/lib/email-verify"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, image: true, phone: true, companyId: true, createdAt: true,
      enrollments: true,
      company: true,
      progress: { select: { completed: true, lessonId: true } },
      _count: { select: { progress: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ users })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { userId } = await req.json()
  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ message: "Usuário removido" })
}

/** Reenvia o email de verificação para um cliente que ainda não confirmou a conta. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = z.object({ userId: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } })
  if (!user) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  if (user.emailVerified) return NextResponse.json({ error: "E-mail já verificado" }, { status: 400 })

  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } })
  const issued = newEmailToken()
  await prisma.verificationToken.create({
    data: { identifier: user.email, token: issued.hash, expires: issued.expires },
  })

  const link = verifyEmailLink(issued.token)
  let sent = false
  if (emailEnabled()) {
    const tpl = verifyEmailTemplate(link)
    sent = await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html })
  }
  return NextResponse.json({ ok: true, sent, ...(sent ? {} : { link }) })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { userId, role, name, companyId, phone } = await req.json()
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role, name, companyId, phone },
    select: { id: true, name: true, email: true, role: true, companyId: true, phone: true },
  })
  return NextResponse.json(updated)
}
