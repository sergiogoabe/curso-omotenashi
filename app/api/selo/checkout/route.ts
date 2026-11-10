import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { prisma } from "@/lib/prisma"
import { seloCheckoutSchema, SELO_TIERS } from "@/lib/selo"
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit"
import { sendEmail, escapeHtml } from "@/lib/email"
import { gerarPixPayload, PIX_KEY } from "@/lib/pix"

export const runtime = "nodejs"

/**
 * Checkout público do Selo Omotenashi: cria PendingCertification e devolve
 * o PIX (dinâmico Asaas quando possível, estático como fallback). O webhook
 * ativa a certificação (Company + status "treinando") após o pagamento.
 */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req.headers), { limit: 5, windowSec: 60, prefix: "selo" })
    if (!rl.ok) return tooMany(rl.retryAfter)

    const parsed = seloCheckoutSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { companyName, email, cnpj, tier } = parsed.data
    const tierConfig = SELO_TIERS[tier]

    const existingPending = await prisma.pendingCertification.findUnique({ where: { email } })
    if (existingPending) {
      return NextResponse.json({ error: "Já existe uma compra pendente para este email. Aguarde a confirmação do pagamento." }, { status: 400 })
    }

    // Fallback padrão: PIX estático da chave central
    let pixPayload = gerarPixPayload(tierConfig.value)
    let pixQR = await QRCode.toDataURL(pixPayload, { width: 400, margin: 2, color: { dark: "#000", light: "#FFF" } })

    const pending = await prisma.pendingCertification.create({
      data: {
        companyName,
        email,
        cnpj,
        tier,
        value: tierConfig.value,
        pixPayload,
      },
    })

    // Fluxo preferencial: cobrança PIX dinâmica no Asaas (ativação automática via webhook)
    let asaasPaymentId: string | null = null
    let invoiceUrl: string | null = null
    if (process.env.ASAAS_API_KEY) {
      try {
        const { criarCliente, criarCobrancaPix, obterPixQrCode } = await import("@/lib/asaas/asaas")
        const customer = await criarCliente(companyName, email, cnpj)
        const charge = await criarCobrancaPix({
          customerId: customer.id,
          valorCentavos: Math.round(tierConfig.value * 100),
          descricao: `Selo Omotenashi — ${tierConfig.label}`,
          vencimento: new Date().toISOString().slice(0, 10),
          externalReference: pending.id,
        })
        const qr = await obterPixQrCode(charge.id)
        pixPayload = qr.payload
        pixQR = qr.encodedImage.startsWith("data:") ? qr.encodedImage : `data:image/png;base64,${qr.encodedImage}`
        asaasPaymentId = charge.id
        invoiceUrl = charge.invoiceUrl ?? null
        await prisma.pendingCertification.update({
          where: { id: pending.id },
          data: { asaasPaymentId: charge.id, pixPayload: qr.payload },
        })
      } catch (err) {
        console.warn("[Asaas] Falha ao criar cobrança do selo, usando PIX estático:", err)
      }
    }

    try {
      const safeName = escapeHtml(companyName)
      await sendEmail({
        to: email,
        subject: `Pagamento PIX - ${tierConfig.label} - R$ ${tierConfig.value.toFixed(2)}`,
        html: `
          <h2>Pagamento PIX Gerado ⛩️</h2>
          <p>Olá <strong>${safeName}</strong>,</p>
          <p>Recebemos o interesse da sua empresa no ${tierConfig.label}! Realize o pagamento via PIX:</p>
          <h3>Valor: R$ ${tierConfig.value.toFixed(2)}</h3>
          <p><strong>Chave PIX:</strong> <code>${PIX_KEY}</code></p>
          ${invoiceUrl ? `<p>Ou pague pelo link seguro: <a href="${invoiceUrl}">${invoiceUrl}</a></p>` : ""}
          <p>Após a confirmação do pagamento, sua empresa entra na etapa de treinamento e receberá
          as orientações por email. A certificação e o selo são emitidos após a avaliação.</p>
          <p>Qualquer dúvida, entre em contato com nosso suporte.</p>
          <p>Obrigado!</p>
        `,
      })
    } catch (err) {
      console.warn("[Email] Falha ao enviar PIX do selo:", err)
    }

    return NextResponse.json({
      pendingId: pending.id,
      tier,
      value: tierConfig.value,
      pixPayload,
      pixQR,
      invoiceUrl,
      message: "Pagamento criado. Após a confirmação, iniciaremos o treinamento da sua equipe.",
    })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    if (typeof error === "object" && error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Já existe uma compra pendente para este email" }, { status: 409 })
    }
    console.error("Selo checkout error")
    return NextResponse.json({ error: "Erro ao criar registro. Tente novamente mais tarde." }, { status: 500 })
  }
}
