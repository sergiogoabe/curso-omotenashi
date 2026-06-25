import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const buf = await req.text()
    const sig = req.headers.get("stripe-signature") || ""
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret!)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any
      const { plan, name, email, password } = session.metadata || {}

      await prisma.payment.updateMany({
        where: { checkoutId: session.id },
        data: { status: "completed" },
      })

      const hashedPassword = await bcrypt.hash(password || "senha123", 12)
      const user = await prisma.user.upsert({
        where: { email },
        create: {
          name: name || "Aluno",
          email,
          password: hashedPassword,
          role: "student",
        },
        update: {},
      })

      await prisma.enrollment.create({
        data: {
          userId: user.id,
          plan: plan || "individual",
          active: true,
        },
      })

      await prisma.payment.updateMany({
        where: { checkoutId: session.id },
        data: { userId: user.id, status: "completed" },
      })
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as any
      await prisma.payment.updateMany({
        where: { checkoutId: session.id },
        data: { status: "expired" },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
