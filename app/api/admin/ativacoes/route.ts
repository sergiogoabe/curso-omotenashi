import { NextResponse } from "next/server"
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

  await prisma.pendingRegistration.update({
    where: { id },
    data: { activationCode: code },
  })

  return NextResponse.json({ code, email: pending.email, name: pending.name })
}
