import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== "admin") return null
  return session
}

export function publicError(error: unknown) {
  const message = error instanceof Error ? error.message : ""
  if (message.includes("23503") || message.toLowerCase().includes("foreign key")) return "Vínculo inválido"
  if (typeof error === "object" && error && "code" in error) {
    const code = String((error as { code: string }).code)
    if (code === "P2002") return "Já existe um registro com esses dados"
    if (code === "P2003") return "Vínculo inválido"
    if (code === "P2021") return "A tabela ainda não existe no banco. Rode a migration do Prisma."
    if (code === "P2025") return "Registro não encontrado"
    if (code.startsWith("P")) return "Não foi possível salvar"
  }
  if (error instanceof Error && !("code" in error)) return error.message
  return "Não foi possível concluir a ação"
}
