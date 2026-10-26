export const PLANS = {
  free: {
    label: "Omotenashi - Plano Free",
    value: 2,
    description: "Acesso inicial ao Omotenashi",
  },
  individual: {
    label: "Omotenashi - Plano Pessoal",
    value: 197,
    description: "Acesso vitalício ao curso para 1 aluno",
  },
  empresarial30: {
    label: "Omotenashi - Plano Empresarial Basic",
    value: 1497,
    description: "Até 30 colaboradores com suporte prioritário",
  },
  empresarial50: {
    label: "Omotenashi - Plano Empresarial Starter",
    value: 2497,
    description: "Até 50 colaboradores com suporte VIP",
  },
  combo: {
    label: "Omotenashi - Plano Empresarial Premium",
    value: 3200,
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