export const PLANS = {
  free: {
    label: "Plano Free",
    value: 2,
    valueInCents: 200,
    priceId: (process.env.STRIPE_PRICE_ID_FREE ?? "price_1UQrVjBQnjylkI7pgP9SDuv7") as string | undefined,
    description: "Acesso inicial ao Omotenashi",
  },
  individual: {
    label: "Individual",
    value: 197,
    valueInCents: 19700,
    priceId: "price_1UQjS0BQnjylkI7pqLOe4Whe" as string | undefined,
    description: "Acesso vitalício ao curso para 1 aluno",
  },
  empresarial30: {
    label: "Empresarial 30",
    value: 1497,
    valueInCents: 149700,
    priceId: undefined as string | undefined,
    description: "Até 30 colaboradores com suporte prioritário",
  },
  empresarial50: {
    label: "Empresarial 50",
    value: 2497,
    valueInCents: 249700,
    priceId: "price_1UQjSkBQnjylkI7pbRcr8BT6" as string | undefined,
    description: "Até 50 colaboradores com suporte VIP",
  },
  combo: {
    label: "Combo Empresarial",
    value: 3200,
    valueInCents: 320000,
    priceId: undefined as string | undefined,
    description: "Curso + consultoria presencial",
  },
} as const

export type PlanId = keyof typeof PLANS

export const PLAN_IDS = Object.keys(PLANS) as PlanId[]

export function getPlan(planId?: string | null) {
  return PLANS[(planId && planId in PLANS ? planId : "individual") as PlanId]
}

export function getPlanValue(planId?: string | null): number {
  return getPlan(planId).value
}
