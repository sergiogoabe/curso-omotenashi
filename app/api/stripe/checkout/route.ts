import { NextResponse } from "next/server"
import { stripe, PLANS } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { plan, name, email, password } = await req.json()

    const planConfig = PLANS[plan || "individual"]
    if (!planConfig) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Curso Omotenashi - ${planConfig.label}`,
              description: planConfig.description,
            },
            unit_amount: planConfig.value,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://curso-omotenashi.vercel.app"}/auth/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://curso-omotenashi.vercel.app"}/auth/register`,
      customer_email: email,
      metadata: {
        plan,
        name,
        email,
        password,
      },
    })

    const payment = await prisma.payment.create({
      data: {
        stripeId: session.id,
        checkoutId: session.id,
        email,
        name,
        plan,
        value: planConfig.value / 100,
        status: "pending",
        paymentMethod: "stripe",
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar checkout" }, { status: 500 })
  }
}
