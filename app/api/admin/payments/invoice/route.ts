import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"
import { consultarPagamento } from "@/lib/asaas/asaas"

export const dynamic = "force-dynamic"

/** Retorna a fatura (invoiceUrl) e o status atuais de uma cobrança no Asaas. */
export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  const payment = await prisma.payment.findUnique({ where: { id: parsed.data.id } })
  if (!payment) return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 })
  if (!payment.asaasId) return NextResponse.json({ error: "Pagamento sem cobrança no Asaas" }, { status: 400 })

  try {
    const charge = await consultarPagamento(payment.asaasId)
    return NextResponse.json({ invoiceUrl: charge.invoiceUrl ?? null, status: charge.status })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 502 })
  }
}
