type ProgressRow = { completed: boolean }
type EnrollmentRow = { active: boolean }

export type CompanyEmployeeRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  courseAccess: boolean
  completedLessons: number
  totalLessons: number
  progressPercent: number
  enrolled: boolean
}

export function mapCompanyEmployees(
  users: Array<{
    id: string
    name: string | null
    email: string
    phone: string | null
    role: string
    courseAccess: boolean
    progress: ProgressRow[]
    enrollments: EnrollmentRow[]
  }>,
  totalLessons: number,
): CompanyEmployeeRow[] {
  const total = Math.max(totalLessons, 1)
  return users.map((user) => {
    const completedLessons = user.progress.filter((row) => row.completed).length
    return {
      id: user.id,
      name: user.name || "Sem nome",
      email: user.email,
      phone: user.phone,
      role: user.role,
      courseAccess: user.courseAccess,
      completedLessons,
      totalLessons,
      progressPercent: Math.round((completedLessons / total) * 100),
      enrolled: user.enrollments.some((row) => row.active) || user.courseAccess,
    }
  })
}
