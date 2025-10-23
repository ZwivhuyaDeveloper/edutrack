# EduTrack Dashboard Architecture Guide

## Overview
This document defines the 5-page navigation structure for all user roles in the EduTrack system. Each role has a **Home page** (default) plus **4 operational pages** that consolidate all features.

## Design Principles
1. **Consistency**: All roles follow the same 5-page structure
2. **Role-Based Access**: Each page contains role-specific features and views
3. **Feature Consolidation**: Related features grouped into logical operational domains
4. **Scalability**: Architecture supports adding features without new pages

---

## Core Navigation Structure (5 Pages)

### Page 1: **Home** (Dashboard Overview)
- **Purpose**: Quick insights, metrics, and alerts
- **Features**: Stats cards, charts, recent activity, quick actions
- **Access**: All roles (role-specific content)

### Page 2: **Academic**
- **Purpose**: Teaching, learning, and academic management
- **Scope**: Classes, subjects, assignments, grades, lesson plans, timetable

### Page 3: **People**
- **Purpose**: User and relationship management
- **Scope**: Students, teachers, parents, staff, enrollment, profiles

### Page 4: **Communication**
- **Purpose**: Messaging, events, and information sharing
- **Scope**: Messages, announcements, events, notifications

### Page 5: **Operations**
- **Purpose**: Administrative tasks and system management
- **Scope**: Finance, attendance, resources, reports, settings

---

## Role-Specific Page Mapping

## 1. PRINCIPAL Dashboard

### 🏠 Home
**Route**: `/dashboard/principal/home`
**Features**:
- School-wide statistics (students, teachers, classes, attendance rate)
- Enrollment trends chart
- Fee collection overview
- Pending approvals/actions
- Recent activity feed
- Quick action buttons

### 📚 Academic
**Route**: `/dashboard/principal/academic`
**Features**:
- Class management (create, view, edit classes)
- Subject management
- Teacher-class assignments overview
- Academic calendar & terms
- Curriculum oversight
- Performance analytics
- Grade distribution reports
- Lesson plan review

### 👥 People
**Route**: `/dashboard/principal/people`
**Features**:
- Teachers management (view, add, edit, permissions)
- Students management (enrollment, transfer, status)
- Parents management
- Staff management
- Role assignments
- User profiles
- Bulk import/export
- Department organization

### 💬 Communication
**Route**: `/dashboard/principal/communication`
**Features**:
- School-wide announcements
- Event management (create, schedule, manage)
- Messaging (staff, parents, departments)
- Notifications center
- Parent-teacher meeting scheduling
- Communication templates
- Broadcast messaging

### ⚙️ Operations
**Route**: `/dashboard/principal/operations`
**Features**:
- Financial overview (fees, payments, pending)
- Attendance monitoring (school-wide)
- Resource management (rooms, facilities)
- Reports & analytics
- School settings
- Audit logs
- Data exports
- System configuration

---

## 2. TEACHER Dashboard

### 🏠 Home
**Route**: `/dashboard/teacher/home`
**Features**:
- My classes overview
- Today's schedule
- Pending assignments to grade
- Student attendance summary
- Recent submissions
- Upcoming events
- Quick actions (create assignment, take attendance)

### 📚 Academic
**Route**: `/dashboard/teacher/academic`
**Features**:
- My classes & subjects
- Assignment management (create, grade, track)
- Gradebook (grade entry, categories, calculations)
- Lesson plans (create, edit, view)
- Class timetable
- Curriculum materials
- Academic calendar

### 👥 People
**Route**: `/dashboard/teacher/people`
**Features**:
- My students (view, search, filter by class)
- Student profiles & performance
- Parent contacts
- Class rosters
- Student grouping
- Individual student analytics

### 💬 Communication
**Route**: `/dashboard/teacher/communication`
**Features**:
- Messages (parents, students, colleagues)
- Class announcements
- Event calendar
- Parent communication log
- Meeting scheduling
- Notifications

### ⚙️ Operations
**Route**: `/dashboard/teacher/operations`
**Features**:
- Attendance management (take, view, reports)
- Resource access (teaching materials, documents)
- My reports (class performance, attendance)
- Grade reports export
- Personal settings
- Help & documentation

---

## 3. STUDENT Dashboard

### 🏠 Home
**Route**: `/dashboard/student/home`
**Features**:
- My classes overview
- Today's schedule
- Upcoming assignments
- Recent grades
- Attendance status
- Upcoming events
- Notifications

### 📚 Academic
**Route**: `/dashboard/student/academic`
**Features**:
- My classes & subjects
- Assignments (view, submit, track)
- Gradebook (view grades, GPA)
- Class schedule & timetable
- Lesson materials
- Academic calendar
- Study resources

### 👥 People
**Route**: `/dashboard/student/people`
**Features**:
- My teachers
- Classmates
- School directory
- Study groups
- Teacher office hours
- Contact information

### 💬 Communication
**Route**: `/dashboard/student/communication`
**Features**:
- Messages (teachers, classmates)
- Announcements (class, school)
- Event calendar
- Notifications
- Parent portal link
- Discussion forums

### ⚙️ Operations
**Route**: `/dashboard/student/operations`
**Features**:
- My attendance record
- Fee statements & payments
- Resource downloads
- Reports (grade reports, transcripts)
- Profile settings
- Help center

---

## 4. PARENT Dashboard

### 🏠 Home
**Route**: `/dashboard/parent/home`
**Features**:
- Children overview (all enrolled)
- Recent grades & performance
- Attendance summary
- Upcoming events
- Fee payment status
- Important announcements
- Quick access to children

### 📚 Academic
**Route**: `/dashboard/parent/academic`
**Features**:
- Children's classes & subjects
- Assignment tracking (per child)
- Grade viewing & history
- Academic progress reports
- Teacher feedback
- Curriculum overview
- Performance analytics

### 👥 People
**Route**: `/dashboard/parent/people`
**Features**:
- My children's profiles
- Their teachers
- Their classmates
- Parent-teacher contacts
- School staff directory
- Emergency contacts

### 💬 Communication
**Route**: `/dashboard/parent/communication`
**Features**:
- Messages (teachers, school)
- School announcements
- Event calendar & RSVP
- Meeting requests
- Notifications
- Parent community
- Feedback & concerns

### ⚙️ Operations
**Route**: `/dashboard/parent/operations`
**Features**:
- Fee management (view, pay, history)
- Attendance monitoring
- Reports & documents
- Permission forms
- Profile settings
- Payment methods
- Receipt downloads

---

## 5. CLERK Dashboard

### 🏠 Home
**Route**: `/dashboard/clerk/home`
**Features**:
- Fee collection overview
- Today's transactions
- Pending payments
- Recent invoices
- Payment stats
- Quick actions (record payment, create invoice)

### 📚 Academic
**Route**: `/dashboard/clerk/academic`
**Features**:
- Student enrollment records
- Class fee structures
- Term fee schedules
- Academic year setup
- Fee categories
- Scholarship management

### 👥 People
**Route**: `/dashboard/clerk/people`
**Features**:
- Student accounts
- Parent contacts
- Account status
- Student directory
- Payment history per student
- Contact information

### 💬 Communication
**Route**: `/dashboard/clerk/communication`
**Features**:
- Fee reminders & notices
- Payment confirmations
- Messages (parents, admin)
- Event calendar
- Notifications
- Announcement viewing

### ⚙️ Operations
**Route**: `/dashboard/clerk/operations`
**Features**:
- Fee management (create, edit fees)
- Payment processing
- Invoice generation
- Receipt management
- Financial reports
- Payment methods setup
- Refund processing
- Data exports
- Settings

---

## Database Schema Mapping

### Academic Domain
**Entities**: Class, Subject, ClassSubject, Assignment, Grade, GradeItem, GradeCategory, LessonPlan, Term, Teaching_Assignments

### People Domain
**Entities**: User, StudentProfile, TeacherProfile, ParentProfile, PrincipalProfile, ClerkProfile, ParentChildRelationship, Enrollment

### Communication Domain
**Entities**: Message, Conversation, ConversationParticipant, Announcement, Event, EventAttendee, EventAudience, Notification

### Operations Domain
**Entities**: Attendance, AttendanceSession, Payment, Invoice, StudentAccount, Fee_Records, Resource, Room, Period, ClassMeeting, AuditLog

---

## Implementation Guidelines

### 1. Page Structure
```
/dashboard/[role]/
  ├── home/page.tsx          # Home dashboard
  ├── academic/page.tsx      # Academic operations
  ├── people/page.tsx        # People management
  ├── communication/page.tsx # Communication hub
  └── operations/page.tsx    # Operations & settings
```

### 2. Component Organization
- **Shared Components**: `/src/components/[domain]`
- **Role-Specific**: `/src/components/[role]`
- **Reusable UI**: `/src/components/ui`

### 3. Navigation Configuration
```typescript
// Example for Principal
export const principalNavigation = [
  { title: "Home", icon: Home, href: "/dashboard/principal/home" },
  { title: "Academic", icon: BookOpen, href: "/dashboard/principal/academic" },
  { title: "People", icon: Users, href: "/dashboard/principal/people" },
  { title: "Communication", icon: MessageSquare, href: "/dashboard/principal/communication" },
  { title: "Operations", icon: Settings, href: "/dashboard/principal/operations" }
]
```

### 4. Feature Access Control
```typescript
// Role-based feature visibility
const featureAccess = {
  PRINCIPAL: { academic: 'full', people: 'full', communication: 'full', operations: 'full' },
  TEACHER: { academic: 'write', people: 'read', communication: 'write', operations: 'limited' },
  STUDENT: { academic: 'read', people: 'read', communication: 'write', operations: 'self' },
  PARENT: { academic: 'read-child', people: 'read-child', communication: 'write', operations: 'self' },
  CLERK: { academic: 'read', people: 'read', communication: 'read', operations: 'finance' }
}
```

---

## Migration Path

### Phase 1: Principal Dashboard (Current Priority)
1. ✅ Keep `home/page.tsx` unchanged
2. Consolidate existing pages:
   - `assignments/` + `reports/` + lesson planning → `academic/page.tsx`
   - `people/page.tsx` → Keep as is (already consolidated)
   - `messages/` + `events/` + announcements → `communication/page.tsx`
   - `finance/` + `operations/` + `settings/` → `operations/page.tsx`
3. Remove old directories
4. Update navigation configuration

### Phase 2: Other Roles
Apply same structure to Teacher, Student, Parent, and Clerk dashboards

### Phase 3: Optimization
- Shared component library
- Performance optimization
- Analytics integration

---

## Benefits

1. **Simplified Navigation**: Users find features faster
2. **Consistent UX**: Same structure across all roles
3. **Easier Maintenance**: Less code duplication
4. **Better Performance**: Fewer route definitions
5. **Scalability**: New features fit into existing structure
6. **Mobile-Friendly**: Fewer tabs on mobile devices

---

## Notes

- All pages support responsive design (mobile, tablet, desktop)
- Each page has tabs/sections for feature organization
- Search and filter capabilities on all list views
- Role-based content visibility within pages
- Breadcrumb navigation for deep features
- Quick actions accessible from all pages

---

**Last Updated**: January 23, 2025
**Version**: 1.0
**Status**: Implementation Ready
