import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "session_id obrigatório" })
    }

    const checkout = await stripe.checkout.sessions.retrieve(sessionId)

    if (checkout.payment_status === "paid") {
      const { plan, name, email, password } = checkout.metadata || {}

      const existingPayment = await prisma.payment.findFirst({
        where: { checkoutId: sessionId, status: "completed" },
      })

      if (!existingPayment) {
        await prisma.payment.updateMany({
          where: { checkoutId: sessionId },
          data: { status: "completed" },
        })

        if (email) {
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

          const existingEnroll = await prisma.enrollment.findFirst({
            where: { userId: user.id, active: true },
          })
          if (!existingEnroll) {
            await prisma.enrollment.create({
              data: { userId: user.id, plan: plan || "individual", active: true },
            })
          }

          await prisma.payment.updateMany({
            where: { checkoutId: sessionId },
            data: { userId: user.id },
          })
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Pagamento não confirmado" })
  } catch (error: any) {
    console.error("Verify error:", error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
