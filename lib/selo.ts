import { z } from "zod"

export const SELO_TIERS = {
  prata: { label: "Selo Prata", value: 1497, colaboradores: "Até 30 colaboradores" },
  ouro: { label: "Selo Ouro", value: 2497, colaboradores: "Até 50 colaboradores" },
  diamante: { label: "Selo Diamante", value: 3200, colaboradores: "Consultoria presencial + auditoria" },
} as const

export type SeloTier = keyof typeof SELO_TIERS

export const SELO_TIER_IDS = Object.keys(SELO_TIERS) as SeloTier[]

export function getSeloTier(tier?: string | null) {
  return SELO_TIERS[(tier && tier in SELO_TIERS ? tier : "prata") as SeloTier]
}

export function isSeloTier(value: string): value is SeloTier {
  return Object.prototype.hasOwnProperty.call(SELO_TIERS, value)
}

export const SELO_STATUSES = ["treinando", "avaliacao", "certificado", "vencido", "suspenso"] as const
export type SeloStatus = (typeof SELO_STATUSES)[number]

export const SELO_STATUS_LABEL: Record<SeloStatus, string> = {
  treinando: "Em treinamento",
  avaliacao: "Em avaliação",
  certificado: "Certificado",
  vencido: "Vencido",
  suspenso: "Suspenso",
}

export function isSeloVencido(status: string, expiresAt: Date | string | null | undefined, now = new Date()): boolean {
  return status === "vencido" || (expiresAt ? new Date(expiresAt) < now : false)
}

/** CNPJ: 14 dígitos + dígitos verificadores. */
export function isValidCnpj(value: string): boolean {
  const cnpj = value.replace(/\D/g, "")
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false
  const calc = (len: number) => {
    let sum = 0
    let pos = len - 7
    for (let i = 0; i < len; i++) {
      sum += Number(cnpj[i]) * pos--
      if (pos < 2) pos = 9
    }
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13])
}

export const seloCheckoutSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Nome da empresa muito curto")
    .max(120, "Nome da empresa muito longo"),
  email: z.string().trim().toLowerCase().email("Email inválido").max(254),
  cnpj: z
    .string()
    .refine(isValidCnpj, "CNPJ inválido")
    .transform((value) => value.replace(/\D/g, "")),
  tier: z.enum(["prata", "ouro", "diamante"], { message: "Selecione um selo" }),
})

export type SeloCheckoutInput = z.infer<typeof seloCheckoutSchema>
