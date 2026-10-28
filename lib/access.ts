import { prisma } from "@/lib/prisma"

export async function syncCourseAccess(input: {
  userId: string
  plan: string
  active: boolean
  expiresAt?: Date | null
}) {
  const { userId, plan, active } = input

  if (!active) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { courseAccess: false },
      }),
      prisma.enrollment.updateMany({
        where: { userId, active: true },
        data: { active: false },
      }),
    ])
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      courseAccess: true,
      coursePlan: plan,
      plan,
      ...(input.expiresAt !== undefined ? { courseExpiresAt: input.expiresAt } : {}),
    },
  })

  const current = await prisma.enrollment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  if (current) {
    await prisma.enrollment.update({
      where: { id: current.id },
      data: {
        active: true,
        plan,
        ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
      },
    })
  } else {
    await prisma.enrollment.create({
      data: {
        userId,
        plan,
        active: true,
        expiresAt: input.expiresAt ?? null,
      },
    })
  }
}
