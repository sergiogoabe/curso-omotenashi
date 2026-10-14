import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { fulfillPayment } from "@/lib/fulfill-payment"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId || !/^cs_[a-zA-Z0-9_]{1,240}$/.test(sessionId)) {
      return NextResponse.json({ success: false, error: "session_id inválido" }, { status: 400 })
    }

    const checkout = await getStripe().checkout.sessions.retrieve(sessionId)

    if (checkout.payment_status === "paid") {
      await fulfillPayment(checkout)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Pagamento não confirmado" })
  } catch (error: any) {
    console.error("Payment verification failed")
    return NextResponse.json({ success: false, error: "Não foi possível verificar o pagamento" }, { status: 500 })
  }
}
