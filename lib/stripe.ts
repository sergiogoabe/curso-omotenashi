import Stripe from "stripe"
import { PLANS, type PlanId } from "./plans"

export { PLANS } from "./plans"

let _stripe: Stripe | undefined

/**
 * Instancia o cliente Stripe de forma preguiçosa (lazy).
 * Evita que `new Stripe()` seja avaliado no topo do módulo, o que quebra
 * o `next build` (coleta de páginas) quando STRIPE_SECRET_KEY não está setada
 * (ex.: builds de Preview).
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY não configurada")
    }
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  }
  return _stripe
}

export function getPlanValueInCents(planId: string): number {
  return PLANS[planId as PlanId]?.valueInCents || PLANS.individual.valueInCents
}

export function getPlanLabel(planId: string): string {
  return PLANS[planId as PlanId]?.label || PLANS.individual.label
}
