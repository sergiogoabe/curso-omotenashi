import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  let database = "ok"
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    database = "error"
  }

  return NextResponse.json({
    appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
    adminLogin: Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
    email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    asaas: Boolean(process.env.ASAAS_API_KEY),
    redis: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    database,
    nodeEnv: process.env.NODE_ENV || "development",
  })
}
