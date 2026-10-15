export const PLANS = {
  individual: {
    label: "Individual",
    value: 197,
    valueInCents: 19700,
    description: "Acesso vitalício ao curso para 1 aluno",
  },
  empresarial30: {
    label: "Empresarial 30",
    value: 1497,
    valueInCents: 149700,
    description: "Até 30 colaboradores com suporte prioritário",
  },
  empresarial50: {
    label: "Empresarial 50",
    value: 2497,
    valueInCents: 249700,
    description: "Até 50 colaboradores com suporte VIP",
  },
  combo: {
    label: "Combo Empresarial",
    value: 3200,
    valueInCents: 320000,
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
