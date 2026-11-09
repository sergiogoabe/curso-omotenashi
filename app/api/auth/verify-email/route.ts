import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashEmailToken } from "@/lib/email-verify"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || ""
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Link inválido" }, { status: 400 })
  }

  const hash = hashEmailToken(token)
  const row = await prisma.verificationToken.findUnique({ where: { token: hash } })
  if (!row || row.expires < new Date()) {
    if (row) await prisma.verificationToken.delete({ where: { token: hash } }).catch(() => {})
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: row.identifier }, select: { id: true } })
  if (!user) {
    await prisma.verificationToken.delete({ where: { token: hash } }).catch(() => {})
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 })
  }

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { email: row.identifier }, data: { emailVerified: new Date() } }),
      prisma.verificationToken.delete({ where: { token: hash } }),
    ])
  } catch {
    return NextResponse.json({ error: "Não foi possível confirmar. Tente novamente." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
