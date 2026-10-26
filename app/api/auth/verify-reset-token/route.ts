import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token não fornecido" }, { status: 400 })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ valid: false, error: "Token inválido ou expirado" }, { status: 400 })
    }

    return NextResponse.json({ valid: true, email: user.email })
  } catch (error) {
    console.error("Verify reset token error:", error)
    return NextResponse.json({ valid: false, error: "Erro interno" }, { status: 500 })
  }
}