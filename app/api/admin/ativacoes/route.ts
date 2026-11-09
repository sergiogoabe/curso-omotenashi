import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const pendings = await prisma.pendingRegistration.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, plan: true, value: true, activationCode: true, pixPayload: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json(pendings)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await req.json()
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
