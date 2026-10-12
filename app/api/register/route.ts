import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registrationSchema } from "@/lib/registration"
import { gerarPixPayload } from "@/lib/pix"
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit"

export const runtime = "nodejs"

const PLANS: Record<string, { label: string; value: number }> = {
  individual: { label: "Individual", value: 197.0 },
  empresarial30: { label: "Empresarial 30 func.", value: 1497.0 },
  empresarial50: { label: "Empresarial 50 func.", value: 2497.0 },
  combo: { label: "Combo Empresarial", value: 3200.0 },
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req.headers), { limit: 5, windowSec: 60, prefix: "register" })
    if (!rl.ok) return tooMany(rl.retryAfter)
    const parsed = registrationSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { name, email, password, plan } = parsed.data

    const planConfig = PLANS[plan || "individual"]
    if (!planConfig) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } })
    if (pending) {
      return NextResponse.json({ error: "Já existe um cadastro pendente para este email. Aguarde o email de ativação." }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const pixPayload = gerarPixPayload(planConfig.value)

    await prisma.pendingRegistration.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plan: plan || "individual",
        value: planConfig.value,
        pixPayload,
      },
    })

    return NextResponse.json({
      plan: plan || "individual",
      value: planConfig.value,
      pixPayload,
      pixQR: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pixPayload)}`,
    })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email já cadastrado ou aguardando ativação" }, { status: 409 })
    }
    console.error("Register error")
    return NextResponse.json({ error: "Erro ao criar registro. Tente novamente mais tarde." }, { status: 500 })
  }
}
