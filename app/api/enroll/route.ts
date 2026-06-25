import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const { plan } = await req.json()

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      plan: plan || "individual",
      active: true,
    },
  })

  return NextResponse.json(enrollment)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ enrollments: [] })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { enrollments: true },
  })

  return NextResponse.json({ enrollments: user?.enrollments || [] })
}
