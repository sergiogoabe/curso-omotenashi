import { NextResponse } from "next/server"
import { handleOmotenashiWebhook } from "@/src/lib/asaas"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("asaas-signature") ?? ""

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 })
  }

  try {
    const success = await handleOmotenashiWebhook(rawBody, signature)
    
    if (!success) {
      return NextResponse.json({ error: "Webhook inválido" }, { status: 400 })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook Asaas error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}