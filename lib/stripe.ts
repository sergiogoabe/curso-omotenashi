import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
})

export const PLANS: Record<string, { label: string; value: number; description: string }> = {
  individual: { label: "Individual", value: 19700, description: "Acesso vitalício ao curso para 1 aluno" },
  empresarial30: { label: "Empresarial 30", value: 149700, description: "Até 30 colaboradores com suporte prioritário" },
  empresarial50: { label: "Empresarial 50", value: 249700, description: "Até 50 colaboradores com suporte VIP" },
  combo: { label: "Combo Empresarial", value: 320000, description: "Curso + consultoria presencial" },
}

export function getPlanValueInCents(planId: string): number {
  return PLANS[planId]?.value || 19700
}

export function getPlanLabel(planId: string): string {
  return PLANS[planId]?.label || "Individual"
}
