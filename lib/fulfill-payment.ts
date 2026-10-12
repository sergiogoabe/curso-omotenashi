import type Stripe from "stripe"
import { prisma } from "@/lib/prisma"

// Claim the payment in the same transaction as account creation. Duplicate
// webhook deliveries and the verification endpoint cannot grant access twice.
export async function fulfillPayment(checkout: Stripe.Checkout.Session) {
  if (checkout.payment_status !== "paid") return false
  return prisma.$transaction(async tx => {
    const payment = await tx.payment.findUnique({ where: { checkoutId: checkout.id } })
    if (!payment) throw new Error("Unknown checkout")
    if (payment.status === "completed") return true
    if (checkout.currency !== "brl" || checkout.amount_total !== Math.round(payment.value * 100)) {
      throw new Error("Payment amount mismatch")
    }
    const registrationId = checkout.metadata?.registrationId
    if (!registrationId) throw new Error("Legacy checkout requires manual reconciliation")
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "completed" } },
      data: { status: "completed" },
    })
    if (claimed.count === 0) return true
    const pending = await tx.pendingRegistration.findUnique({ where: { id: registrationId } })
    if (!pending || pending.email !== payment.email || pending.plan !== payment.plan || pending.value !== payment.value) {
      throw new Error("Registration mismatch")
    }
    const user = await tx.user.upsert({
      where: { email: pending.email },
      create: { email: pending.email, name: pending.name, password: pending.password, role: "student" },
      update: {},
    })
    await tx.enrollment.create({ data: { userId: user.id, plan: payment.plan, active: true } })
    await tx.payment.update({ where: { id: payment.id }, data: { userId: user.id } })
    await tx.pendingRegistration.delete({ where: { id: pending.id } })
    return true
  })
}
