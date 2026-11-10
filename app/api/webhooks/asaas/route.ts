import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncCourseAccess } from "@/lib/access"
import { verificarAssinaturaWebhook } from "@/lib/asaas/asaas"
import { emailEnabled, sendEmail, verifyEmailTemplate } from "@/lib/email"
import { newEmailToken, verifyEmailLink } from "@/lib/email-verify"

export const dynamic = "force-dynamic"

/**
 * Webhook Asaas — ativação automática da conta após pagamento PIX confirmado.
 * Fluxo: PAYMENT_RECEIVED/PAYMENT_CONFIRMED → localiza PendingRegistration pelo
 * asaasPaymentId (ou externalReference) → cria User + Enrollment + email de verificação.
 */
export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("asaas-signature") ?? ""

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 })
  }

  if (!(await verificarAssinaturaWebhook(rawBody, signature))) {
    console.error("[Asaas Webhook] Assinatura inválida")
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

    const user = await prisma.$transaction(async (tx: any) => {
      const created = await tx.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          password: pending.password,
          role: "student",
          plan: pending.plan,
        },
      })
      await tx.pendingRegistration.delete({ where: { id: pending.id } })
      return created
    })

    await syncCourseAccess({
      userId: user.id,
      plan: pending.plan,
      active: true,
    })

    await prisma.payment.create({
      data: {
        asaasId: payment.id,
        userId: user.id,
        email: pending.email,
        name: pending.name,
        plan: pending.plan,
        value: pending.value,
        status: "paid",
        paymentMethod: "pix",
      },
    }).catch(() => {})

    const issued = newEmailToken()
    await prisma.verificationToken.create({
      data: { identifier: user.email, token: issued.hash, expires: issued.expires },
    })
    const link = verifyEmailLink(issued.token)
    if (emailEnabled()) {
      const tpl = verifyEmailTemplate(link)
      const sent = await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html })
      if (!sent) console.error(`[Verify Email] Falha ao enviar para ${user.email} — link de recuperação: ${link}`)
    } else {
      console.log(`[Verify Email] ${user.email} ${link}`)
    }

    console.log(`[Asaas Webhook] Conta ativada: ${user.email} (pagamento ${payment.id})`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Asaas webhook error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
