import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function hasCourseAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false
  if ((session.user as any).role === "admin") return true
  return Boolean(await prisma.enrollment.findFirst({
    where: {
      user: { email: session.user.email }, active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true },
  }))
}
