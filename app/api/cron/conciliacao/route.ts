import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { consultarPagamento } from "@/lib/asaas/asaas"
import { ativarRegistro } from "@/lib/asaas/ativar"
import { ativarCertificacao } from "@/lib/selo/ativar"
import { emailEnabled, sendEmail, conciliacaoEmailTemplate, ConciliacaoResumoEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

function autorizado(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : ""
  if (!token) return false
  const a = Buffer.from(token)
  const b = Buffer.from(secret)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function erroMensagem(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "object" && err !== null && "message" in err) return String((err as { message: unknown }).message)
  return "falha ao consultar"
}

export type ConciliacaoResumo = ConciliacaoResumoEmail

/**
 * Conciliação diária (rede de segurança do webhook): confere no Asaas cada
 * pending com cobrança dinâmica (curso e selo), ativa os pagos que o webhook
 * perdeu, marca selos vencidos, avisa renovações ≤30d e envia
 * relatório/heartbeats por email ao admin. Agenda em vercel.json.
 */
export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const agora = new Date()

  const pendings = await prisma.pendingRegistration.findMany({
    where: { asaasPaymentId: { not: null } },
    select: { id: true, name: true, email: true, password: true, plan: true, value: true, asaasPaymentId: true },
    orderBy: { createdAt: "asc" },
  })

  const usersByEmail = await prisma.user.findMany({
    where: { email: { in: pendings.map((item) => item.email) } },
    select: { email: true },
  })
  const takenEmails = new Set(usersByEmail.map((user) => user.email.toLowerCase()))

  const resumo: ConciliacaoResumo = {
    conferidos: pendings.length,
    ativados: [],
    conflitos: [],
    erros: [],
    aguardando: [],
    ultimoEventoWebhook: null,
    selos: { conferidos: 0, ativados: [], aguardando: [], vencidosHoje: 0, vencendo: [] },
  }

  for (const pending of pendings) {
    if (!pending.asaasPaymentId) continue
    try {
      const charge = await consultarPagamento(pending.asaasPaymentId)
      const paid = charge.status === "RECEIVED" || charge.status === "CONFIRMED"
      if (!paid) {
        resumo.aguardando.push({ email: pending.email, status: charge.status })
        continue
      }
      if (takenEmails.has(pending.email.toLowerCase())) {
        resumo.conflitos.push(pending.email)
        continue
      }
      await ativarRegistro(pending, pending.asaasPaymentId)
      resumo.ativados.push({ name: pending.name, email: pending.email })
    } catch (err) {
      resumo.erros.push({ email: pending.email, motivo: erroMensagem(err) })
    }
  }

  // Selo Omotenashi: concilia compras pagas e expira selos certificados.
  const pendingsSelo = await prisma.pendingCertification.findMany({
    where: { asaasPaymentId: { not: null } },
    orderBy: { createdAt: "asc" },
  })
  resumo.selos.conferidos = pendingsSelo.length

  for (const pending of pendingsSelo) {
    if (!pending.asaasPaymentId) continue
    try {
      const charge = await consultarPagamento(pending.asaasPaymentId)
      const paid = charge.status === "RECEIVED" || charge.status === "CONFIRMED"
      if (!paid) {
        resumo.selos.aguardando.push({ company: pending.companyName, status: charge.status })
        continue
      }
      await ativarCertificacao(pending, pending.asaasPaymentId)
      resumo.selos.ativados.push({ company: pending.companyName, tier: pending.tier })
    } catch (err) {
      resumo.erros.push({ email: `selo ${pending.companyName}`, motivo: erroMensagem(err) })
    }
  }

  const vencidos = await prisma.certification.updateMany({
    where: { status: "certificado", expiresAt: { lt: agora } },
    data: { status: "vencido" },
  })
  resumo.selos.vencidosHoje = vencidos.count

  const limiteRenovacao = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000)
  const vencendo = await prisma.certification.findMany({
    where: { status: "certificado", expiresAt: { gte: agora, lte: limiteRenovacao } },
    include: { company: { select: { name: true } } },
    orderBy: { expiresAt: "asc" },
  })
  for (const selo of vencendo) {
    const dias = Math.ceil((new Date(selo.expiresAt as Date).getTime() - agora.getTime()) / (24 * 60 * 60 * 1000))
    resumo.selos.vencendo.push({ company: selo.company.name, tier: selo.tier, dias })
  }

  const lastPing = await prisma.webhookPing.findFirst({ orderBy: { createdAt: "desc" } })
  resumo.ultimoEventoWebhook = lastPing?.createdAt ?? null

  const destinatario = process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_USERNAME || null
  let notified = false
  if (destinatario && emailEnabled()) {
    const tpl = conciliacaoEmailTemplate(resumo)
    notified = await sendEmail({ to: destinatario, subject: tpl.subject, html: tpl.html })
  }

  return NextResponse.json({
    conferidos: resumo.conferidos,
    ativados: resumo.ativados,
    conflitos: resumo.conflitos,
    erros: resumo.erros,
    aguardando: resumo.aguardando,
    ultimoEventoWebhook: resumo.ultimoEventoWebhook,
    selos: resumo.selos,
    notified,
  })
}
