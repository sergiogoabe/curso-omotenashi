import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    include: {
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
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (admin?.role !== "admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { userId } = await req.json()
  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ message: "Usuário removido" })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (admin?.role !== "admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { userId, role, name, companyId, phone } = await req.json()
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role, name, companyId, phone },
  })
  return NextResponse.json(updated)
}
