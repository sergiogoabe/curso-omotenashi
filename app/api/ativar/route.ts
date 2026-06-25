import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    if (!code) {
      return NextResponse.json({ error: "Código de ativação é obrigatório" }, { status: 400 })
    }

    const pending = await prisma.pendingRegistration.findUnique({
      where: { activationCode: code },
    })

    if (!pending) {
      return NextResponse.json({ error: "Código de ativação inválido" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: pending.email } })
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } })
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: "student",
      },
    })

    await prisma.enrollment.create({
      data: {
        userId: user.id,
        plan: pending.plan,
        active: true,
      },
    })

    await prisma.pendingRegistration.delete({ where: { id: pending.id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Activation error:", error)
    return NextResponse.json({ error: error.message || "Erro ao ativar conta" }, { status: 500 })
  }
}
