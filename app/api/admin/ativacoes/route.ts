import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { consultarPagamento } from "@/lib/asaas/asaas"
import { ativarRegistro } from "@/lib/asaas/ativar"
import crypto from "crypto"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const pendings = await prisma.pendingRegistration.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      value: true,
      activationCode: true,
      cpf: true,
      asaasPaymentId: true,
      pixPayload: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const usersByEmail = await prisma.user.findMany({
    where: { email: { in: pendings.map((item) => item.email) } },
    select: { email: true },
  })
  const takenEmails = new Set(usersByEmail.map((user) => user.email.toLowerCase()))

  return NextResponse.json(
    pendings.map((pending) => ({
      ...pending,
      userExists: takenEmails.has(pending.email.toLowerCase()),
    }))
  )
}

const bodySchema = z.union([
  z.object({ action: z.literal("conferir"), id: z.string().min(1) }),
  z.object({ id: z.string().min(1) }),
])

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  if ("action" in parsed.data) {
    const pending = await prisma.pendingRegistration.findUnique({ where: { id: parsed.data.id } })
    if (!pending) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 })
    if (!pending.asaasPaymentId) {
      return NextResponse.json({ error: "Cadastro sem cobrança Asaas (PIX estático) — use o código manual" }, { status: 400 })
    }

    let asaasStatus: string
    try {
      const charge = await consultarPagamento(pending.asaasPaymentId)
      asaasStatus = charge.status
    } catch (err) {
      return NextResponse.json({ error: `Asaas: ${err instanceof Error ? err.message : "falha ao consultar"}` }, { status: 502 })
    }

    const paid = asaasStatus === "RECEIVED" || asaasStatus === "CONFIRMED"
    const existingUser = await prisma.user.findUnique({ where: { email: pending.email } })
    if (existingUser) {
      return NextResponse.json({ asaasStatus, activated: false, userExists: true })
    }

    if (!paid) {
      return NextResponse.json({ asaasStatus, activated: false, userExists: false })
    }

    const { userId, emailSent } = await ativarRegistro(pending, pending.asaasPaymentId)
    return NextResponse.json({ asaasStatus, activated: true, userId, emailSent })
  }

  const { id } = parsed.data
  const pending = await prisma.pendingRegistration.findUnique({ where: { id } })
  if (!pending) {
    return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 })
  }

  if (pending.activationCode) {
    return NextResponse.json({ error: "Código já gerado anteriormente", code: pending.activationCode }, { status: 400 })
  }

  const code = crypto.randomBytes(4).toString("hex").toUpperCase()

  const user = await prisma.user.findFirst({
    where: { email: { equals: pending.email, mode: "insensitive" } },
    select: { id: true },
  })

  await prisma.$transaction(async (tx: any) => {
    await tx.pendingRegistration.update({
      where: { id },
      data: { activationCode: code },
    })
    await tx.payment.create({
      data: {
        email: pending.email.toLowerCase(),
        name: pending.name,
        plan: pending.plan,
        value: pending.value,
        status: "confirmed",
        paymentMethod: "pix",
        userId: user?.id ?? null,
      },
    })
  })

  return NextResponse.json({ code, email: pending.email, name: pending.name })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  await prisma.pendingRegistration.delete({ where: { id: parsed.data.id } })
  return NextResponse.json({ ok: true })
}
