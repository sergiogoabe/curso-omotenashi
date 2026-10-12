import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req.headers), { limit: 10, windowSec: 60, prefix: "ativar" })
    if (!rl.ok) return tooMany(rl.retryAfter)
    const { code } = await req.json()
    if (typeof code !== "string" || !/^[A-Fa-f0-9]{8}$/.test(code)) {
      return NextResponse.json({ error: "Código de ativação é obrigatório" }, { status: 400 })
    }

    const pending = await prisma.pendingRegistration.findUnique({
      where: { activationCode: code.toUpperCase() },
    })

    if (!pending) {
      return NextResponse.json({ error: "Código de ativação inválido" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: pending.email } })
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } })
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: { name: pending.name, email: pending.email, password: pending.password, role: "student" },
      })
      await tx.enrollment.create({ data: { userId: user.id, plan: pending.plan, active: true } })
      await tx.pendingRegistration.delete({ where: { id: pending.id } })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    console.error("Activation error")
    return NextResponse.json({ error: "Erro ao ativar conta. Tente novamente." }, { status: 500 })
  }
}
