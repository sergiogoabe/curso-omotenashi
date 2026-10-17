import { NextResponse } from "next/server"
import { PLANS } from "@/lib/stripe"
import { getStripe } from "@/lib/stripe"

export const runtime = "nodejs"

export async function GET() {
  const plans = await Promise.all(
    Object.entries(PLANS).map(async ([id, plan]) => {
      let amount: number = plan.valueInCents
      let currency = "brl"
      let priceId = plan.priceId ?? null
      if (plan.priceId) {
        try {
          const price = await getStripe().prices.retrieve(plan.priceId)
          if (typeof price.unit_amount === "number") amount = price.unit_amount
          currency = price.currency
          priceId = price.id
        } catch {
          // mantém fallback local
        }
      }
      return {
        id,
        name: `Omotenashi - ${plan.label}`,
        description: plan.description,
        priceId,
        amount,
        currency,
        interval: "once",
      }
    }),
  )
  return NextResponse.json({ plans })
}
