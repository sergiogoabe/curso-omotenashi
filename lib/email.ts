import { Resend } from "resend"

const API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM || "Omotenashi <noreply@infinity-agency.online>"

let cached: Resend | null = null

/** Escapes user-provided text before interpolation into HTML emails. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function client(): Resend {
  if (!API_KEY) throw new Error("RESEND_API_KEY não configurada")
  if (!cached) cached = new Resend(API_KEY)
  return cached
}

export function emailEnabled(): boolean {
  return Boolean(API_KEY)
}

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  try {
    const result = await client().emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    if (result.error) {
      console.error("[Email] Falha no envio:", result.error)
      return false
    }
    return true
  } catch (error) {
    console.error("[Email] Erro inesperado:", error)
    return false
  }
}

export function verifyEmailTemplate(link: string) {
  return {
    subject: "Confirme seu email — Omotenashi",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a2e;">Confirme seu email</h1>
        <p>Sua conta foi criada. Confirme o email para entrar (válido por <strong>24 horas</strong>):</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Confirmar email</a>
        </p>
        <p style="color: #999; font-size: 12px;">Se o botão não funcionar, copie e cole no navegador:<br><span style="word-break: break-all;">${link}</span></p>
      </div>
    `,
  }
}

export function passwordResetEmail(link: string) {
  return {
    subject: "Redefinir sua senha — Omotenashi",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a2e;">Redefinir senha</h1>
        <p>Você solicitou a redefinição de sua senha no Omotenashi. Use o botão abaixo (válido por <strong>1 hora</strong>):</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Redefinir senha</a>
        </p>
        <p style="color: #666; font-size: 14px;">Se você não pediu isso, ignore este e-mail — sua senha permanece intacta.</p>
        <p style="color: #999; font-size: 12px;">Se o botão não funcionar, copie e cole no navegador:<br><span style="word-break: break-all;">${link}</span></p>
      </div>
    `,
  }
}

export type ConciliacaoResumoEmail = {
  conferidos: number
  ativados: { name: string; email: string }[]
  conflitos: string[]
  erros: { email: string; motivo: string }[]
  aguardando: { email: string; status: string }[]
  ultimoEventoWebhook: Date | null
  selos: {
    conferidos: number
    ativados: { company: string; tier: string }[]
    aguardando: { company: string; status: string }[]
    vencidosHoje: number
    vencendo: { company: string; tier: string; dias: number }[]
  }
}

/** Relatório diário da conciliação automática para o admin (cron). */
export function conciliacaoEmailTemplate(resumo: ConciliacaoResumoEmail) {
  const alertas =
    resumo.ativados.length + resumo.conflitos.length + resumo.erros.length + resumo.selos.ativados.length
  const subject = alertas > 0 ? `[Ação necessária] Conciliação diária — Omotenashi` : "Conciliação diária OK — Omotenashi"

  const li = (texto: string) => `<li style="margin-bottom: 4px;">${escapeHtml(texto)}</li>`
  const secao = (titulo: string, itens: string[]) =>
    itens.length ? `<h3 style="margin: 16px 0 8px; color: #1a1a2e;">${escapeHtml(titulo)}</h3><ul style="padding-left: 20px;">${itens.map(li).join("")}</ul>` : ""

  const horasSemEvento = resumo.ultimoEventoWebhook
    ? Math.floor((Date.now() - new Date(resumo.ultimoEventoWebhook).getTime()) / 3_600_000)
    : null

  return {
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a2e;">Conciliação diária</h1>
        <p>${resumo.conferidos} cadastro(s) com PIX dinâmico conferidos no Asaas.</p>
        ${secao("Ativados agora (webhook não processou)", resumo.ativados.map((a) => `${a.name} — ${a.email}`))}
        ${secao("Pagos com e-mail já cadastrado (resolver em /admin/ativacoes)", resumo.conflitos)}
        ${secao("Erros na consulta ao Asaas", resumo.erros.map((e) => `${e.email} — ${e.motivo}`))}
        ${secao("Aguardando pagamento", resumo.aguardando.map((a) => `${a.email} — ${a.status}`))}
        <h2 style="color: #1a1a2e; margin-top: 24px;">Selo Omotenashi</h2>
        <p>${resumo.selos.conferidos} compra(s) de selo conferida(s); ${resumo.selos.vencidosHoje} selo(s) marcado(s) como vencido(s) hoje.</p>
        ${secao("Selos ativados agora", resumo.selos.ativados.map((s) => `${s.company} — ${s.tier}`))}
        ${secao("Selos pagos não processados (ver /admin/selo)", resumo.selos.aguardando.map((s) => `${s.company} — ${s.status}`))}
        ${secao("Selos vencendo em até 30 dias (renovar)", resumo.selos.vencendo.map((s) => `${s.company} — ${s.tier} — vence em ${s.dias} dia(s)`))}
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Último evento do webhook: ${horasSemEvento === null ? "nunca" : `há ${horasSemEvento}h`}.
          Nenhum alerta acima significa que tudo está em ordem.
        </p>
      </div>
    `,
  }
}
