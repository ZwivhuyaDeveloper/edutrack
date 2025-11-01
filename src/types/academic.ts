export interface Class {
  id: string
  name: string
  grade: string
  section: string
  _count: {
    enrollments: number
    subjects: number
    assignments: number
  }
  subjects: Array<{
    id: string
    subject: {
      name: string
      code: string
    }
    teacher: {
      firstName: string
      lastName: string
    }
  }>
}

export interface Subject {
  id: string
  name: string
  code: string
  description?: string
  _count: {
    classSubjects: number
    assignments: number
  }
}

export interface Assignment {
  id: string
  title: string
  dueDate: string
  maxPoints?: number
  class: {
    name: string
    grade: string
  }
  subject: {
    name: string
  }
  _count: {
    submissions: number
  }
}

export interface Grade {
  id: string
  points: number
  maxPoints: number
  student: {
    firstName: string
    lastName: string
  }
  gradeItem: {
    name: string
    class: {
      name: string
    }
    subject: {
      name: string
    }
  }
  gradedAt: string
}

export interface TotalClassesSummary {
  totalClasses: number
  activeClasses: number
  averageStudentsPerClass: number
  gradeDistribution: Array<{
    grade: string
    count: number
  }>
  recentClasses: Array<{
    id: string
    name: string
    grade: string | null
    section: string | null
    createdAt: string
    activeStudents: number
  }>
}

export interface AcademicStats {
  totalClasses: number;
  // Add other stats fields as needed
}
