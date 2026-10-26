import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "node:crypto"
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req.headers), { limit: 5, windowSec: 3600, prefix: "reset-password" })
    if (!rl.ok) return tooMany(rl.retryAfter)

    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6 || password.length > 72) {
      return NextResponse.json({ error: "A senha deve ter entre 6 e 72 caracteres" }, { status: 400 })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    })

    return NextResponse.json({ message: "Senha redefinida com sucesso" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 })
  }
}