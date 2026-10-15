import { NextResponse } from "next/server"
import { getStripe, PLANS } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registrationSchema } from "@/lib/registration"
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req.headers), { limit: 5, windowSec: 60, prefix: "checkout" })
    if (!rl.ok) return tooMany(rl.retryAfter)
    const parsed = registrationSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    const { plan, name, email, password } = parsed.data
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Pagamento indisponível" }, { status: 503 })

    const planConfig = PLANS[plan || "individual"]
    if (!planConfig) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const existingPending = await prisma.pendingRegistration.findUnique({ where: { email } })
    if (existingPending && (existingPending.plan !== plan || !(await bcrypt.compare(password, existingPending.password)))) {
      return NextResponse.json({ error: "Já existe um cadastro pendente com outros dados. Entre em contato." }, { status: 409 })
    }
    const pending = existingPending ?? await prisma.pendingRegistration.create({
      data: { name, email, password: await bcrypt.hash(password, 12), plan, value: planConfig.value },
    })
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Curso Omotenashi - ${planConfig.label}`,
              description: planConfig.description,
            },
            unit_amount: planConfig.valueInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://curso-omotenashi.vercel.app"}/auth/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://curso-omotenashi.vercel.app"}/auth/register`,
      customer_email: pending.email,
      metadata: {
        plan: pending.plan,
        name: pending.name,
        email: pending.email,
        registrationId: pending.id,
      },
    }, { idempotencyKey: `registration-${pending.id}` })
    if (!session.url || session.status === "expired") {
      return NextResponse.json({ error: "Checkout expirado. Entre em contato para reiniciar o pagamento." }, { status: 409 })
    }

    await prisma.payment.upsert({
      where: { checkoutId: session.id },
      update: {},
      create: {
        stripeId: session.id,
        checkoutId: session.id,
        email,
        name,
        plan,
        value: planConfig.value,
        status: "pending",
        paymentMethod: "stripe",
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    console.error("Stripe checkout error")
    return NextResponse.json({ error: "Erro ao criar checkout. Entre em contato se o cadastro já estiver pendente." }, { status: 500 })
  }
}
