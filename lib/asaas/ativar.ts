import { prisma } from "@/lib/prisma"
import { emailEnabled, sendEmail, verifyEmailTemplate } from "@/lib/email"
import { newEmailToken, verifyEmailLink } from "@/lib/email-verify"

/**
 * Ativa uma PendingRegistration paga: cria User + matrícula, registra Payment,
 * remove o pending e envia o email de verificação. Compartilhado entre o
 * webhook Asaas e a conciliação manual do admin (/admin/ativacoes).
 */
export async function ativarRegistro(
  pending: { id: string; name: string; email: string; password: string; plan: string; value: number },
  asaasPaymentId: string
): Promise<{ userId: string; verifyLink: string; emailSent: boolean }> {
  const user = await prisma.$transaction(async (tx: any) => {
    const created = await tx.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: "student",
        plan: pending.plan,
        courseAccess: true,
        coursePlan: pending.plan,
      },
    })
    await tx.enrollment.create({
      data: {
        userId: created.id,
        plan: pending.plan,
        active: true,
      },
    })
    await tx.payment.create({
      data: {
        asaasId: asaasPaymentId,
        userId: created.id,
        email: pending.email,
        name: pending.name,
        plan: pending.plan,
        value: pending.value,
        status: "paid",
        paymentMethod: "pix",
      },
    })
    await tx.pendingRegistration.delete({ where: { id: pending.id } })
    return created
  })

  const issued = newEmailToken()
  await prisma.verificationToken.create({
    data: { identifier: user.email, token: issued.hash, expires: issued.expires },
  })
  const link = verifyEmailLink(issued.token)
  let emailSent = false
  if (emailEnabled()) {
    const tpl = verifyEmailTemplate(link)
    emailSent = await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html })
    if (!emailSent) console.error(`[Verify Email] Falha ao enviar para ${user.email} — link de recuperação: ${link}`)
  } else {
    console.log(`[Verify Email] ${user.email} ${link}`)
  }

  return { userId: user.id, verifyLink: link, emailSent }
}
