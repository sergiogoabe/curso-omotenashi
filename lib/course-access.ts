import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { courseAccessFrom } from "@/lib/course-access-rule"

export async function hasCourseAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false
  if ((session.user as { role?: string }).role === "admin") return true

  const user = await prisma.user.findFirst({
    where: { email: { equals: session.user.email, mode: "insensitive" } },
    select: { id: true, courseAccess: true, courseExpiresAt: true },
  })
  if (!user) return false

  const now = new Date()
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: { active: true, expiresAt: true },
  })

  // A matrícula define o período contratado: vencida, ela revoga o acesso.
  // A flag do usuário vale para quem não tem matrícula (liberação manual).
  return courseAccessFrom({ ...user, enrollments }, now)
}
