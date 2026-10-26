import { Resend } from "resend"

const API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM || "Omotenashi <onboarding@resend.dev>"

let cached: Resend | null = null

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

export function passwordResetEmail(link: string) {
  return {
    subject: "Redefinir sua senha — Omotenashi",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a2e;">Redefinir senha</h1>
        <p>Você solicitou a redefinição da sua senha no Omotenashi. Use o botão abaixo (válido por <strong>1 hora</strong>):</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Redefinir senha</a>
        </p>
        <p style="color: #666; font-size: 14px;">Se você não pediu isso, ignore este e-mail — sua senha permanece intacta.</p>
        <p style="color: #999; font-size: 12px;">Se o botão não funcionar, copie e cole no navegador:<br><span style="word-break: break-all;">${link}</span></p>
      </div>
    `,
  }
}
