import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { isSeloTier } from "@/lib/selo"

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function novoVerifyCode() {
  const bytes = randomBytes(10)
  let code = ""
  for (let i = 0; i < bytes.length; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  return `OMO-${code.slice(0, 4)}-${code.slice(4, 8)}`
}

/** Cria Certification com verifyCode único (retry em colisão rara). */
export async function createCertificationComCodigo(client: any, data: Record<string, unknown>) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await client.certification.create({ data: { ...data, verifyCode: novoVerifyCode() } })
    } catch (error) {
      const code = (error as { code?: string }).code
      if (code !== "P2002") throw error
    }
  }
  throw new Error("Não foi possível gerar um código de verificação. Tente novamente.")
}

/**
 * Ativa uma PendingCertification paga: cria (ou reutiliza) a Company e a
 * Certification em status "treinando", registra o Payment e remove o pending.
 * Usuários gestores continuam sendo criados manualmente, como no curso.
 */
export async function ativarCertificacao(
  pending: { id: string; companyName: string; email: string; cnpj?: string | null; tier: string; value: number },
  asaasPaymentId: string
): Promise<{ companyId: string; certificationId: string; verifyCode: string }> {
  const tier = isSeloTier(pending.tier) ? pending.tier : "prata"

  return prisma.$transaction(async (tx: any) => {
    const company =
      (await tx.company.findUnique({ where: { email: pending.email } })) ??
      (await tx.company.create({
        data: {
          name: pending.companyName,
          email: pending.email,
          cnpj: pending.cnpj || null,
          plan: "business",
        },
      }))

    const certification = await createCertificationComCodigo(tx, {
      companyId: company.id,
      tier,
      status: "treinando",
    })

    await tx.pendingCertification.delete({ where: { id: pending.id } })

    await tx.payment.create({
      data: {
        asaasId: asaasPaymentId,
        email: pending.email,
        name: pending.companyName,
        plan: `selo-${tier}`,
        value: pending.value,
        status: "paid",
        paymentMethod: "pix",
      },
    })

    return { companyId: company.id, certificationId: certification.id, verifyCode: certification.verifyCode as string }
  })
}
