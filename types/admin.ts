export type ClientRow = {
  id: string
  name: string | null
  email: string
  role: string
  phone: string | null
  plan: string
  courseAccess: boolean
  coursePlan: string | null
  courseExpiresAt: string | null
  companyId: string | null
  createdAt: string
  company: { id: string; name: string } | null
  enrollments: { id: string; plan: string; active: boolean; expiresAt: string | null }[]
  progress: { id: string }[]
}

export type PaymentRow = {
  id: string
  email: string
  name: string | null
  plan: string
  value: number
  status: string
  paymentMethod: string
  createdAt: string
  user: { id: string; name: string | null; email: string } | null
}

export type EventRow = {
  id: string
  title: string
  description: string | null
  type: string
  location: string | null
  startsAt: string
  endsAt: string | null
  capacity: number | null
  status: string
  companyId: string | null
  company: { id: string; name: string } | null
}

export type CompanyOption = { id: string; name: string; active?: boolean }

export type OverviewStats = {
  users: number
  lessons: number
  chapters: number
  enrollments: number
  activeEnrollments: number
  companies: number
  associates: number
  courseAccess: number
  pending: number
  forumOpen: number
  eventsUpcoming: number
  revenue: number
  revenuePending: number
  payments: number
  plans: { plan: string; count: number }[]
  recentPayments: PaymentRow[]
  recentUsers: { id: string; name: string | null; email: string; plan: string; courseAccess: boolean; createdAt: string; company: { name: string } | null }[]
  upcomingEvents: EventRow[]
}
