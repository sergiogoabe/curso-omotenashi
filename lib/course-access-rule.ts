export type CourseAccessInput = {
  courseAccess: boolean
  courseExpiresAt?: Date | string | null
  enrollments?: { active: boolean; expiresAt?: Date | string | null }[]
}

/**
 * Regra única de acesso ao curso: matrícula ativa e não vencida concede acesso;
 * a flag do usuário vale apenas para quem não tem matrícula (liberação manual).
 * Módulo puro (sem next-auth/prisma) para ser usado também no cliente.
 */
export function courseAccessFrom(user: CourseAccessInput, now = new Date()): boolean {
  const enrollments = user.enrollments ?? []
  if (enrollments.length > 0) {
    return enrollments.some((e) => e.active && (!e.expiresAt || new Date(e.expiresAt) > now))
  }
  return Boolean(user.courseAccess && (!user.courseExpiresAt || new Date(user.courseExpiresAt) > now))
}
