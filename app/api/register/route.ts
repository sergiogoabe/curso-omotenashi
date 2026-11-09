import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import QRCode from "qrcode"
import { prisma } from "@/lib/prisma"
import { registrationSchema } from "@/lib/registration"
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit"
import { PLANS } from "@/lib/plans"
import { sendEmail, escapeHtml } from "@/lib/email"
import { gerarPixPayload, PIX_KEY } from "@/lib/pix"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req.headers), { limit: 5, windowSec: 60, prefix: "register" })
    if (!rl.ok) return tooMany(rl.retryAfter)
    const parsed = registrationSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { name, email, password, plan } = parsed.data

    const planConfig = PLANS[plan || "individual"]
    if (!planConfig) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const existingPending = await prisma.pendingRegistration.findUnique({ where: { email } })
    if (existingPending) {
      return NextResponse.json({ error: "Já existe um cadastro pendente para este email. Aguarde o email de ativação." }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const pixPayload = gerarPixPayload(planConfig.value)
    const pixQR = await QRCode.toDataURL(pixPayload, { width: 400, margin: 2, color: { dark: '#000', light: '#FFF' } })

    const pending = await prisma.pendingRegistration.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plan: plan || "individual",
        value: planConfig.value,
        pixPayload,
      },
    })

    // Enviar email ao cliente com PIX
    try {
      const safeName = escapeHtml(name)
      await sendEmail({
        to: email,
        subject: `Pagamento PIX - ${planConfig.label} - R$ ${planConfig.value.toFixed(2)}`,
        html: `
          <h2>Pagamento PIX Gerado ⛩️</h2>
          <p>Olá <strong>${safeName}</strong>,</p>
          <p>Seu cadastro foi criado com sucesso! Agora realize o pagamento via PIX:</p>
          <h3>Valor: R$ ${planConfig.value.toFixed(2)}</h3>
          <p><strong>Chave PIX:</strong> <code>${PIX_KEY}</code></p>
          <p><strong>ID do Pagamento:</strong> <code>${escapeHtml(pending.id)}</code></p>
          <p>Após confirmar o pagamento, seu acesso será liberado pela equipe Omotenashi (em até 24h).</p>
          <p>Qualquer dúvida, entre em contato com nosso suporte.</p>
          <p>Obrigado!</p>
        `,
      })
    } catch (err) {
      console.warn('[Email] Failed to send payment confirmation:', err)
    }

    // Sync to Infinity Agency Dashboard ERP
    try {
      const apiKey = process.env.INFINITY_DASHBOARD_API_KEY
      if (apiKey) {
        await fetch(`${process.env.INFINITY_ERP_URL || 'https://erp.infinity-agency.online'}/api/col/omotenashi-users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            email,
            name,
            plan: plan || 'individual',
            status: 'pending_payment',
            createdAt: new Date().toISOString(),
            registrationId: pending.id
          })
        });
      }
    } catch (err) {
      console.warn('[ERP Sync] Failed to sync user:', err);
    }

    return NextResponse.json({
      registrationId: pending.id,
      plan: plan || "individual",
      value: planConfig.value,
      pixPayload,
      pixQR: pixQR,
      message: "Pagamento criado. Você receberá email de confirmação. Seu acesso será liberado após a aprovação da equipe."
    })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email já cadastrado ou aguardando ativação" }, { status: 409 })
    }
    console.error("Register error")
    return NextResponse.json({ error: "Erro ao criar registro. Tente novamente mais tarde." }, { status: 500 })
  }
}
