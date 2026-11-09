import crypto from "node:crypto"

export function hashEmailToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function newEmailToken() {
  const token = crypto.randomBytes(32).toString("hex")
  return { token, hash: hashEmailToken(token), expires: new Date(Date.now() + 24 * 60 * 60 * 1000) }
}

export function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://curso-omotenashi.vercel.app"
}

export function verifyEmailLink(token: string) {
  return `${appBaseUrl()}/auth/verificar-email?token=${token}`
}
