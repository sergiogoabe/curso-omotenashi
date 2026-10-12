import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { fulfillPayment } from "@/lib/fulfill-payment"

export async function POST(req: Request) {
  try {
    const buf = await req.text()
    const sig = req.headers.get("stripe-signature") || ""
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) return NextResponse.json({ error: "Webhook indisponível" }, { status: 503 })

    let event
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret!)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfillPayment(event.data.object)
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as any
      await prisma.payment.updateMany({
        where: { checkoutId: session.id, status: "pending" },
        data: { status: "expired" },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook processing failed")
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
