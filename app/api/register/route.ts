import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const PLANS: Record<string, { label: string; value: number }> = {
  individual: { label: "Individual", value: 197.0 },
  empresarial30: { label: "Empresarial 30 func.", value: 1497.0 },
  empresarial50: { label: "Empresarial 50 func.", value: 2497.0 },
  combo: { label: "Combo Empresarial", value: 3200.0 },
}

function crc16(str: string) {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc ^ 0x1021) << 1 : crc << 1
    }
  }
  return ((crc & 0xFFFF) >>> 0).toString(16).toUpperCase().padStart(4, "0")
}

function gerarPixPayload(value: number): string {
  const key = "07030124600"
  const name = "INFINITY AGENCIA"
  const city = "DIVINOPOLIS"
  const valueStr = value.toFixed(2)
  const valueFormatted = valueStr.replace(".", "").padStart(6, "0")
  const payload = [
    "000201",
    "26360014BR.GOV.BCB.PIX0114" + key,
    "52040000",
    "5303986",
    "54" + valueFormatted.length.toString().padStart(2, "0") + valueFormatted,
    "5802BR",
    "59" + name.length.toString().padStart(2, "0") + name,
    "60" + city.length.toString().padStart(2, "0") + city,
    "62070503***",
    "6304",
  ].join("")

  return payload + crc16(payload)
}

export async function POST(req: Request) {
  try {
    const { name, email, password, plan } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

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
  } catch (error: any) {
    console.error("Register error:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar registro" }, { status: 500 })
  }
}
