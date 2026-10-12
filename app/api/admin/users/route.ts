import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, image: true, phone: true, companyId: true, createdAt: true,
      enrollments: true,
      company: true,
      progress: { select: { completed: true, lessonId: true } },
      _count: { select: { progress: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ users })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { userId } = await req.json()
  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ message: "Usuário removido" })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { userId, role, name, companyId, phone } = await req.json()
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role, name, companyId, phone },
    select: { id: true, name: true, email: true, role: true, companyId: true, phone: true },
  })
  return NextResponse.json(updated)
}
