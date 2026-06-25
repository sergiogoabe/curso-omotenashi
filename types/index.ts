export interface CourseModule {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  slug: string
  description: string
  videoUrl?: string
  videoType: "youtube" | "custom"
  duration: string
  content: string
  categoryId: string
  order: number
  completed?: boolean
}

export interface EbookContent {
  id: string
  title: string
  slug: string
  content: string
  order: number
}

export interface UserProfile {
  id: string
  name: string | null
  email: string
  role: "student" | "admin"
  image?: string | null
  enrollments: Enrollment[]
}

export interface Enrollment {
  id: string
  plan: "individual" | "business"
  active: boolean
  expiresAt: string | null
  createdAt: string
}
