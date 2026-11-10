import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validarTokenWebhook } from "@/lib/asaas/asaas"
import { ativarRegistro } from "@/lib/asaas/ativar"

export const dynamic = "force-dynamic"

/**
 * Webhook Asaas — ativação automática da conta após pagamento PIX confirmado.
 * Fluxo: PAYMENT_RECEIVED/PAYMENT_CONFIRMED → localiza PendingRegistration pelo
 * asaasPaymentId (ou externalReference) → cria User + Enrollment + email de verificação.
 * Cada entrega válida é registrada em WebhookPing (saúde visível no admin).
 */
export async function POST(req: Request) {
  const rawBody = await req.text()
  const token = req.headers.get("asaas-access-token") ?? ""

  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 400 })
  }

  if (!validarTokenWebhook(token)) {
    console.error("[Asaas Webhook] Token inválido")
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 })
  }

  let event: string | undefined
  let payment: { id?: string; externalReference?: string | null; value?: number; status?: string } | undefined
  try {
    const payload = JSON.parse(rawBody)
    event = payload?.event
    payment = payload?.payment
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (!payment?.id) return NextResponse.json({ received: true })

  if (event) {
    void prisma.webhookPing
      .create({ data: { event, paymentId: payment.id } })
      .catch(() => {})
  }

  if (event !== "PAYMENT_RECEIVED" && event !== "PAYMENT_CONFIRMED") {
    return NextResponse.json({ received: true })
  }

  try {
    const pending = await prisma.pendingRegistration.findFirst({
      where: {
        OR: [
          { asaasPaymentId: payment.id },
          ...(payment.externalReference ? [{ id: payment.externalReference }] : []),
        ],
      },
    })
    if (!pending) return NextResponse.json({ received: true })

    const existingUser = await prisma.user.findUnique({ where: { email: pending.email } })
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => {})
      return NextResponse.json({ received: true })
    }

    await ativarRegistro(pending, payment.id)

    console.log(`[Asaas Webhook] Conta ativada: ${pending.email} (pagamento ${payment.id})`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Asaas webhook error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
