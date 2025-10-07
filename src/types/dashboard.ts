// Shared types for dashboard navigation
export type PageType = 
  | "dashboard" 
  | "assignments" 
  | "reports" 
  | "messages" 
  | "classes" 
  | "gradebook" 
  | "schedule" 
  | "attendance" 
  | "finance" 
  | "resources" 
  | "events" 
  | "announcements"
  | "students"
  | "timetable"
  | "lessons"
  | "analytics"
  | "settings"

export type UserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'CLERK' | 'ADMIN'

export type SidebarUserRole = "student" | "teacher" | "admin" | "parent"
