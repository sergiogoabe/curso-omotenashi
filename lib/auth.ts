import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rateLimit } from "@/lib/rate-limit"

function ipFromNextAuthReq(req: unknown): string {
  const h = (req as { headers?: Record<string, string | string[] | undefined> } | undefined)?.headers
  const raw = h?.["x-forwarded-for"] ?? h?.["x-real-ip"]
  const value = Array.isArray(raw) ? raw[0] : raw
  return (value?.split(",")[0] || "unknown").trim()
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Usuário ou Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const rl = await rateLimit(ipFromNextAuthReq(req), { limit: 10, windowSec: 60, prefix: "login" })
        if (!rl.ok) throw new Error("Muitas tentativas. Tente novamente em instantes.")

        const identifier = credentials.email.trim()

        const adminUsername = process.env.ADMIN_USERNAME
        const adminPassword = process.env.ADMIN_PASSWORD
        if (
          adminUsername &&
          adminPassword &&
          identifier === adminUsername &&
          credentials.password === adminPassword
        ) {
          return {
            id: "admin",
            email: adminUsername,
            name: "Administrador",
            role: "admin",
            image: null,
          }
        }

        const user = await prisma.user.findFirst({
          where: { email: { equals: identifier, mode: "insensitive" } },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        // Database roles must not remain valid after demotion or deletion.
        if (token.id === "admin" && token.email === process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
          ;(session.user as any).role = "admin"
        } else {
          const currentUser = await prisma.user.findUnique({
            where: { id: String(token.id) }, select: { role: true },
          })
          ;(session.user as any).role = currentUser?.role ?? "revoked"
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
