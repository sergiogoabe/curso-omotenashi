import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function hasCourseAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false
  if ((session.user as { role?: string }).role === "admin") return true

  const user = await prisma.user.findFirst({
    where: { email: { equals: session.user.email, mode: "insensitive" } },
    select: { id: true, courseAccess: true, courseExpiresAt: true },
  })
  if (!user) return false

  const flagged = user.courseAccess && (!user.courseExpiresAt || user.courseExpiresAt > new Date())
  if (flagged) return true

  return Boolean(await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true },
  }))
}
