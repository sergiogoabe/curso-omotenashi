import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Health check endpoint para monitoramento de uptime.
 * Verifica conectividade com o banco de dados.
 * 
 * @returns 200 OK se tudo estiver funcionando
 * @returns 503 Service Unavailable se houver problemas
 */
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Verifica conexão com o banco
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV,
    }, { status: 200 })
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 503 })
  }
}
