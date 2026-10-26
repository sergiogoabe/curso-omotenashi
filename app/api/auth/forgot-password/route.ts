import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit"
import { emailEnabled, passwordResetEmail, sendEmail } from "@/lib/email"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req.headers), { limit: 3, windowSec: 3600, prefix: "forgot-password" })
    if (!rl.ok) return tooMany(rl.retryAfter)

    const { email } = await req.json()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Sempre retorna sucesso para não revelar se o email existe (prevenção de enumeração)
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (user) {
      // Gerar token de reset (expira em 1 hora)
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetTokenHash,
          resetTokenExpiresAt: expiresAt,
        },
      })

      const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-senha?token=${resetToken}`

      if (emailEnabled()) {
        const tpl = passwordResetEmail(link)
        const sent = await sendEmail({ to: normalizedEmail, subject: tpl.subject, html: tpl.html })
        if (!sent) {
          console.error(`[Password Reset] Falha ao enviar email para ${normalizedEmail}. Token: ${resetToken}`)
        }
      } else {
        // Fallback: sem RESEND_API_KEY configurada (desenvolvimento local ou alcance até Resend disponível)
        console.log(`[Password Reset] Token para ${normalizedEmail}: ${resetToken}`)
        console.log(`[Password Reset] Link: ${link}`)
      }
    }

    return NextResponse.json({
      message: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 })
  }
}