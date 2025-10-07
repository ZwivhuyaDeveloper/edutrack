# Principal Role & Dashboard Breakdown

## Table of Contents
1. [Principal Role Overview](#principal-role-overview)
2. [Authentication & Authorization Flow](#authentication--authorization-flow)
3. [Database Schema & Relations](#database-schema--relations)
4. [Clerk Integration](#clerk-integration)
5. [Permissions & Access Control](#permissions--access-control)
6. [Dashboard Structure](#dashboard-structure)
7. [Required Pages](#required-pages)
8. [Reusable Components](#reusable-components)
9. [API Routes](#api-routes)

---

## Principal Role Overview

The **Principal** is the highest administrative authority within a school in the EduTrack system. They have comprehensive control over their school's operations, including:

### Core Responsibilities
- **School Management**: Create and manage the school profile (organization)
- **User Management**: Manage teachers, students, parents, and administrative staff
- **Academic Oversight**: Oversee all classes, subjects, assignments, and grades
- **Staff Management**: Hire, assign, and manage teaching staff
- **Financial Oversight**: View financial reports, fee records, and payment status
- **Communication**: Send announcements, messages to all stakeholders
- **Analytics & Reporting**: Access comprehensive school-wide analytics
- **Schedule Management**: Manage timetables, periods, rooms, and terms
- **Event Management**: Create and manage school-wide events
- **Audit & Compliance**: Access audit logs and system reports

---

## Authentication & Authorization Flow

### 1. School Creation Flow (Setup)

```typescript
// File: src/app/setup-school/page.tsx
// Flow:
1. Principal signs up via Clerk authentication
2. Redirected to /setup-school page
3. Fills out school information form:
   - School details (name, address, contact)
   - Principal profile (employee ID, qualifications, experience)
4. On submission:
   a. POST /api/schools - Creates Clerk Organization
   b. Creates School record in Prisma with clerkOrganizationId
   c. Creates/Updates User record with role='PRINCIPAL'
   d. Creates PrincipalProfile record
   e. Updates Clerk user metadata with role and permissions
5. Redirected to /dashboard (principal home)
```

### 2. Clerk Organization Integration

```typescript
// File: src/app/api/schools/route.ts (Lines 91-127)

// Step 1: Create Clerk Organization
const organization = await clerkClient().organizations.createOrganization({
  name: validatedData.name,
  slug: validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  createdBy: userId, // Principal's Clerk ID
})

// Step 2: Add Principal as Organization Admin
await clerkClient().organizations.createOrganizationMembership({
  organizationId: organization.id,
  userId,
  role: CLERK_ORG_ROLES.PRINCIPAL, // 'org:admin'
})

// Step 3: Update Principal's Metadata
await clerkClient().users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'PRINCIPAL',
    schoolId: school.id,
    schoolName: validatedData.name,
    organizationId: organization.id,
    permissions: getPermissionStrings('PRINCIPAL'),
    isActive: true,
  }
})
```

### 3. Authentication Check

```typescript
// File: src/lib/auth.ts (Lines 8-43)

export async function getCurrentUser() {
  const { userId } = await auth() // Clerk auth
  
  if (!userId) return null

  // Fetch user from Prisma with all relations
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      school: { /* school details */ },
      principalProfile: true, // Principal-specific profile
      // ... other profiles
    }
  })

  return user
}
```

---

## Database Schema & Relations

### Principal-Related Models

#### 1. User Model (Lines 44-118)
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique          // Links to Clerk user
  email     String   @unique
  firstName String
  lastName  String
  role      UserRole                  // PRINCIPAL enum value
  
  schoolId  String                    // Links to School
  school    School   @relation(...)
  
  principalProfile PrincipalProfile?  // One-to-one relation
  
  // Relations principal can manage:
  resourcesCreated Resource[]
  eventsCreated    Event[]
  auditLogs        AuditLog[]
  // ... more relations
}
```

#### 2. PrincipalProfile Model (Lines 170-191)
```prisma
model PrincipalProfile {
  id          String @id @default(cuid())
  principalId String @unique
  principal   User   @relation(...)
  
  // Professional Information
  employeeId          String?
  hireDate            DateTime?
  qualifications      String?
  yearsOfExperience   Int?
  previousSchool      String?
  educationBackground String?
  
  // Contact & Personal
  phone               String?
  address             String?
  emergencyContact    String?
  salary              Float?
  
  // Administrative
  administrativeArea  String?  // e.g., "Academic Affairs"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 3. School Model (Lines 13-42)
```prisma
model School {
  id                  String   @id @default(cuid())
  name                String
  clerkOrganizationId String?  @unique  // Links to Clerk Org
  
  // Location
  address   String?
  city      String?
  state     String?
  zipCode   String?
  country   String   @default("US")
  
  // Contact
  phone     String?
  email     String?
  website   String?
  logo      String?
  
  isActive  Boolean  @default(true)
  
  // Relations - Principal manages all of these:
  users         User[]
  classes       Class[]
  subjects      Subject[]
  terms         Term[]
  rooms         Room[]
  periods       Period[]
  resources     Resource[]
  events        Event[]
  announcements Announcement[]
}
```

### Key Relationships

```
Principal (User with role=PRINCIPAL)
  ├── School (1:1 via schoolId)
  │   ├── Users (1:N) - All school users
  │   ├── Classes (1:N)
  │   ├── Subjects (1:N)
  │   ├── Terms (1:N)
  │   ├── Rooms (1:N)
  │   ├── Periods (1:N)
  │   ├── Resources (1:N)
  │   ├── Events (1:N)
  │   └── Announcements (1:N)
  └── PrincipalProfile (1:1)
```

---

## Clerk Integration

### Clerk Organization Roles (Lines 16-23)
```typescript
// File: src/lib/permissions.ts

export const CLERK_ORG_ROLES = {
  PRINCIPAL: 'org:admin',      // Full administrative access
  TEACHER: 'org:teacher',       // Teaching permissions
  STUDENT: 'org:student',       // Student access
  PARENT: 'org:parent',         // Parent access
  CLERK: 'org:clerk',           // Administrative staff
  ADMIN: 'org:super_admin',     // System administrator
}
```

### Clerk User Metadata (Lines 29-39)
```typescript
export interface ClerkUserMetadata {
  role: UserRole              // 'PRINCIPAL'
  schoolId: string            // Prisma School ID
  schoolName: string          // School name
  organizationId?: string     // Clerk Organization ID
  permissions: string[]       // Array of permission strings
  isActive: boolean           // Account status
}
```

### Principal Metadata Example
```json
{
  "role": "PRINCIPAL",
  "schoolId": "clxyz123abc",
  "schoolName": "Springfield High School",
  "organizationId": "org_2abc123def",
  "permissions": [
    "users:manage",
    "students:manage",
    "teachers:manage",
    "classes:manage",
    "subjects:manage",
    "grades:view_all",
    "attendance:view_all",
    "reports:manage",
    "school:manage",
    // ... 50+ permissions
  ],
  "isActive": true
}
```

---

## Permissions & Access Control

### Principal Permissions (Lines 282-333)

The principal has the most comprehensive permissions in the system:

#### User Management - FULL CONTROL
```typescript
[Resource.USERS]: [PermissionAction.MANAGE],
[Resource.STUDENTS]: [PermissionAction.MANAGE],
[Resource.TEACHERS]: [PermissionAction.MANAGE],
[Resource.PARENTS]: [PermissionAction.MANAGE],
```

#### Academic - FULL CONTROL
```typescript
[Resource.CLASSES]: [PermissionAction.MANAGE],
[Resource.SUBJECTS]: [PermissionAction.MANAGE],
[Resource.ENROLLMENTS]: [PermissionAction.MANAGE],
[Resource.ASSIGNMENTS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
[Resource.GRADES]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
```

#### Attendance - VIEW ALL
```typescript
[Resource.ATTENDANCE]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
[Resource.ATTENDANCE_SESSIONS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
```

#### Schedule - FULL CONTROL
```typescript
[Resource.CLASS_MEETINGS]: [PermissionAction.MANAGE],
[Resource.PERIODS]: [PermissionAction.MANAGE],
[Resource.ROOMS]: [PermissionAction.MANAGE],
[Resource.TERMS]: [PermissionAction.MANAGE],
```

#### Communication - FULL CONTROL
```typescript
[Resource.MESSAGES]: [PermissionAction.MANAGE],
[Resource.CONVERSATIONS]: [PermissionAction.MANAGE],
[Resource.ANNOUNCEMENTS]: [PermissionAction.MANAGE],
[Resource.NOTIFICATIONS]: [PermissionAction.MANAGE],
```

#### Financial - VIEW ONLY
```typescript
[Resource.FEE_RECORDS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
[Resource.INVOICES]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
[Resource.PAYMENTS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
[Resource.STUDENT_ACCOUNTS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
```

#### School Management - FULL CONTROL
```typescript
[Resource.SCHOOL]: [PermissionAction.MANAGE],
[Resource.REPORTS]: [PermissionAction.MANAGE],
[Resource.AUDIT_LOGS]: [PermissionAction.READ, PermissionAction.VIEW_ALL],
```

### Permission Checking Functions (Lines 200-212, 317-320)

```typescript
// File: src/lib/auth.ts

// Check if principal can manage users
export async function canManageUser(targetUserId: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (user.role === 'PRINCIPAL') {
    // Principals can manage teachers, clerks, students, and parents
    return ['TEACHER', 'CLERK', 'STUDENT', 'PARENT'].includes(targetUser.role)
  }
  
  return false
}
```

---

## Dashboard Structure

### Current Structure
```
src/app/dashboard/principal/
├── home/
│   └── page.tsx          # Dashboard home with analytics
├── assignments/
│   └── page.tsx          # View all assignments (school-wide)
├── messages/
│   └── page.tsx          # Communication center
└── reports/
    └── page.tsx          # Reports and analytics
```

### Recommended Full Structure
```
src/app/dashboard/principal/
├── home/
│   └── page.tsx                    # Dashboard overview
├── staff/
│   ├── page.tsx                    # Staff management overview
│   ├── teachers/
│   │   ├── page.tsx                # Teachers list
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Teacher details
│   │   │   └── edit/
│   │   │       └── page.tsx        # Edit teacher
│   │   └── new/
│   │       └── page.tsx            # Add new teacher
│   └── clerks/
│       ├── page.tsx                # Administrative staff list
│       └── [id]/
│           └── page.tsx            # Staff details
├── students/
│   ├── page.tsx                    # Students list
│   ├── [id]/
│   │   ├── page.tsx                # Student details
│   │   └── edit/
│   │       └── page.tsx            # Edit student
│   ├── new/
│   │   └── page.tsx                # Add new student
│   └── bulk-import/
│       └── page.tsx                # Bulk student import
├── parents/
│   ├── page.tsx                    # Parents list
│   └── [id]/
│       └── page.tsx                # Parent details
├── academic/
│   ├── classes/
│   │   ├── page.tsx                # Classes management
│   │   ├── [id]/
│   │   │   └── page.tsx            # Class details
│   │   └── new/
│   │       └── page.tsx            # Create class
│   ├── subjects/
│   │   ├── page.tsx                # Subjects management
│   │   └── new/
│   │       └── page.tsx            # Create subject
│   ├── terms/
│   │   ├── page.tsx                # Terms/semesters
│   │   └── new/
│   │       └── page.tsx            # Create term
│   └── enrollments/
│       └── page.tsx                # Manage enrollments
├── assignments/
│   ├── page.tsx                    # All assignments (view-only)
│   └── [id]/
│       └── page.tsx                # Assignment details
├── grades/
│   ├── page.tsx                    # Grade overview
│   └── reports/
│       └── page.tsx                # Grade reports
├── attendance/
│   ├── page.tsx                    # Attendance overview
│   ├── reports/
│   │   └── page.tsx                # Attendance reports
│   └── trends/
│       └── page.tsx                # Attendance trends
├── schedule/
│   ├── timetable/
│   │   ├── page.tsx                # School timetable
│   │   └── edit/
│   │       └── page.tsx            # Edit timetable
│   ├── periods/
│   │   ├── page.tsx                # Manage periods
│   │   └── new/
│   │       └── page.tsx            # Create period
│   └── rooms/
│       ├── page.tsx                # Manage rooms
│       └── new/
│           └── page.tsx            # Add room
├── finance/
│   ├── overview/
│   │   └── page.tsx                # Financial overview
│   ├── fees/
│   │   └── page.tsx                # Fee records
│   ├── invoices/
│   │   └── page.tsx                # Invoices
│   ├── payments/
│   │   └── page.tsx                # Payments
│   └── reports/
│       └── page.tsx                # Financial reports
├── communication/
│   ├── messages/
│   │   ├── page.tsx                # Messages center
│   │   └── [id]/
│   │       └── page.tsx            # Conversation view
│   ├── announcements/
│   │   ├── page.tsx                # Announcements list
│   │   ├── [id]/
│   │   │   └── page.tsx            # View announcement
│   │   └── new/
│   │       └── page.tsx            # Create announcement
│   └── notifications/
│       └── page.tsx                # Notifications center
├── events/
│   ├── page.tsx                    # Events calendar
│   ├── [id]/
│   │   ├── page.tsx                # Event details
│   │   └── edit/
│   │       └── page.tsx            # Edit event
│   └── new/
│       └── page.tsx                # Create event
├── resources/
│   ├── page.tsx                    # Resource library
│   ├── [id]/
│   │   └── page.tsx                # Resource details
│   └── new/
│       └── page.tsx                # Upload resource
├── reports/
│   ├── page.tsx                    # Reports dashboard
│   ├── academic/
│   │   └── page.tsx                # Academic reports
│   ├── attendance/
│   │   └── page.tsx                # Attendance reports
│   ├── financial/
│   │   └── page.tsx                # Financial reports
│   └── custom/
│       └── page.tsx                # Custom reports
├── analytics/
│   ├── page.tsx                    # Analytics dashboard
│   ├── students/
│   │   └── page.tsx                # Student analytics
│   ├── teachers/
│   │   └── page.tsx                # Teacher analytics
│   └── performance/
│       └── page.tsx                # Performance metrics
├── school/
│   ├── profile/
│   │   ├── page.tsx                # School profile
│   │   └── edit/
│   │       └── page.tsx            # Edit school profile
│   └── settings/
│       └── page.tsx                # School settings
└── audit/
    └── page.tsx                    # Audit logs
```

---

## Required Pages

### 1. Home Dashboard (`/dashboard/principal/home/page.tsx`)

**Purpose**: Overview of school operations with key metrics

**Features**:
- School-wide statistics (students, teachers, classes)
- Recent activity feed
- Upcoming events
- Attendance trends chart
- Financial summary
- Quick actions (add staff, create announcement)
- Alerts and notifications

**Components Used**:
- `<SectionCards />` - Metric cards
- `<ChartAreaInteractive />` - Analytics charts
- `<DataTable />` - Recent activities
- `<QuickActions />` - Action buttons
- `<AlertsPanel />` - Important alerts

---

### 2. Staff Management (`/dashboard/principal/staff/teachers/page.tsx`)

**Purpose**: Manage teaching staff

**Features**:
- Teachers list with search/filter
- Add new teacher
- View teacher details (classes, subjects, performance)
- Edit teacher information
- Assign classes and subjects
- View teaching schedule
- Performance metrics

**Data Fetching**:
```typescript
// Fetch teachers for principal's school
const teachers = await prisma.user.findMany({
  where: {
    schoolId: currentUser.schoolId,
    role: 'TEACHER',
    isActive: true
  },
  include: {
    teacherProfile: true,
    teachingAssignments: {
      include: {
        classSubject: {
          include: {
            class: true,
            subject: true
          }
        }
      }
    }
  }
})
```

**Components**:
- `<TeachersTable />` - Data table with actions
- `<TeacherCard />` - Teacher info card
- `<AddTeacherModal />` - Add teacher form
- `<AssignClassesModal />` - Assign classes

---

### 3. Student Management (`/dashboard/principal/students/page.tsx`)

**Purpose**: Manage student records

**Features**:
- Students list with advanced filters (grade, class, status)
- Add new student
- View student details (grades, attendance, fees)
- Edit student information
- Bulk import students (CSV)
- Student analytics
- Enrollment management

**Data Fetching**:
```typescript
const students = await prisma.user.findMany({
  where: {
    schoolId: currentUser.schoolId,
    role: 'STUDENT',
    isActive: true
  },
  include: {
    studentProfile: true,
    enrollments: {
      include: {
        class: true
      }
    },
    gradesReceived: {
      take: 5,
      orderBy: { gradedAt: 'desc' }
    }
  }
})
```

**Components**:
- `<StudentsTable />` - Filterable data table
- `<StudentCard />` - Student profile card
- `<AddStudentModal />` - Add student form
- `<BulkImportModal />` - CSV import
- `<StudentStatsCard />` - Student statistics

---

### 4. Classes Management (`/dashboard/principal/academic/classes/page.tsx`)

**Purpose**: Manage classes and sections

**Features**:
- Classes list (grade, section, teacher, student count)
- Create new class
- Edit class details
- Assign teachers to classes
- View class timetable
- Manage enrollments
- Class analytics

**Data Fetching**:
```typescript
const classes = await prisma.class.findMany({
  where: {
    schoolId: currentUser.schoolId
  },
  include: {
    subjects: {
      include: {
        subject: true,
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    },
    enrollments: {
      where: { status: 'ACTIVE' }
    },
    _count: {
      select: {
        enrollments: true,
        assignments: true
      }
    }
  }
})
```

**Components**:
- `<ClassesGrid />` - Grid view of classes
- `<ClassCard />` - Class info card
- `<CreateClassModal />` - Create class form
- `<AssignTeacherModal />` - Assign teacher
- `<EnrollmentManager />` - Manage students

---

### 5. Subjects Management (`/dashboard/principal/academic/subjects/page.tsx`)

**Purpose**: Manage subjects/courses

**Features**:
- Subjects list with details
- Create new subject
- Edit subject information
- View subject assignments across classes
- Subject analytics

**Components**:
- `<SubjectsTable />` - Subjects data table
- `<CreateSubjectModal />` - Create subject form
- `<SubjectCard />` - Subject details

---

### 6. Attendance Overview (`/dashboard/principal/attendance/page.tsx`)

**Purpose**: Monitor school-wide attendance

**Features**:
- Overall attendance statistics
- Attendance trends (daily, weekly, monthly)
- Class-wise attendance
- Student attendance reports
- Absenteeism alerts
- Export attendance reports

**Data Fetching**:
```typescript
// Get attendance statistics
const attendanceStats = await prisma.attendance.groupBy({
  by: ['status'],
  where: {
    session: {
      classSubject: {
        class: {
          schoolId: currentUser.schoolId
        }
      },
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  },
  _count: true
})
```

**Components**:
- `<AttendanceChart />` - Attendance trends
- `<AttendanceStatsCards />` - Statistics cards
- `<ClassAttendanceTable />` - Class-wise data
- `<AbsenteesList />` - Students with low attendance

---

### 7. Grades Overview (`/dashboard/principal/grades/page.tsx`)

**Purpose**: Monitor academic performance

**Features**:
- Grade distribution charts
- Class-wise performance
- Subject-wise performance
- Top performers
- Students needing attention
- Grade reports

**Components**:
- `<GradeDistributionChart />` - Grade distribution
- `<PerformanceMetrics />` - Performance cards
- `<TopPerformersTable />` - Top students
- `<ClassPerformanceTable />` - Class comparison

---

### 8. Schedule/Timetable (`/dashboard/principal/schedule/timetable/page.tsx`)

**Purpose**: Manage school timetable

**Features**:
- Weekly timetable view
- Manage periods
- Manage rooms
- Assign classes to periods and rooms
- Conflict detection
- Print timetable

**Data Fetching**:
```typescript
const timetable = await prisma.classMeeting.findMany({
  where: {
    classSubject: {
      class: {
        schoolId: currentUser.schoolId
      }
    }
  },
  include: {
    classSubject: {
      include: {
        class: true,
        subject: true,
        teacher: true
      }
    },
    period: true,
    room: true
  },
  orderBy: [
    { dayOfWeek: 'asc' },
    { period: { order: 'asc' } }
  ]
})
```

**Components**:
- `<TimetableGrid />` - Weekly timetable grid
- `<PeriodManager />` - Manage periods
- `<RoomManager />` - Manage rooms
- `<AssignClassModal />` - Assign class to slot

---

### 9. Financial Overview (`/dashboard/principal/finance/overview/page.tsx`)

**Purpose**: Monitor school finances (view-only)

**Features**:
- Revenue summary
- Outstanding fees
- Payment trends
- Fee collection reports
- Student account balances
- Financial charts

**Data Fetching**:
```typescript
// Get financial summary
const financialSummary = await prisma.$transaction([
  // Total outstanding fees
  prisma.invoice.aggregate({
    where: {
      account: {
        studentId: {
          in: schoolStudentIds
        }
      },
      status: 'PENDING'
    },
    _sum: { total: true }
  }),
  
  // Total collected
  prisma.payment.aggregate({
    where: {
      account: {
        studentId: {
          in: schoolStudentIds
        }
      },
      receivedAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    _sum: { amount: true }
  })
])
```

**Components**:
- `<FinancialStatsCards />` - Financial metrics
- `<RevenueChart />` - Revenue trends
- `<OutstandingFeesTable />` - Unpaid fees
- `<PaymentTrendsChart />` - Payment trends

---

### 10. Communication Center (`/dashboard/principal/communication/messages/page.tsx`)

**Purpose**: Communicate with staff, students, and parents

**Features**:
- Inbox/sent messages
- Compose new message
- Group messaging
- Message templates
- Search and filter
- Attachments support

**Components**:
- `<MessagesList />` - Messages list
- `<MessageComposer />` - Compose message
- `<ConversationView />` - Message thread
- `<RecipientSelector />` - Select recipients

---

### 11. Announcements (`/dashboard/principal/communication/announcements/page.tsx`)

**Purpose**: Create and manage school announcements

**Features**:
- Announcements list
- Create announcement
- Target audience (school-wide, class, subject)
- Priority levels
- Schedule announcements
- View analytics (views, engagement)

**Data Fetching**:
```typescript
const announcements = await prisma.announcement.findMany({
  where: {
    schoolId: currentUser.schoolId
  },
  orderBy: {
    publishedAt: 'desc'
  }
})
```

**Components**:
- `<AnnouncementsList />` - Announcements list
- `<CreateAnnouncementModal />` - Create form
- `<AnnouncementCard />` - Announcement display
- `<AudienceSelector />` - Target audience

---

### 12. Events Calendar (`/dashboard/principal/events/page.tsx`)

**Purpose**: Manage school events

**Features**:
- Calendar view (month, week, day)
- Create event
- Edit/delete events
- Event types (holiday, exam, meeting, sports)
- Event audience
- RSVP tracking
- Export calendar

**Data Fetching**:
```typescript
const events = await prisma.event.findMany({
  where: {
    schoolId: currentUser.schoolId,
    startDate: {
      gte: startDate,
      lte: endDate
    }
  },
  include: {
    audiences: {
      include: {
        class: true,
        subject: true
      }
    },
    attendees: true,
    createdBy: {
      select: {
        firstName: true,
        lastName: true
      }
    }
  },
  orderBy: {
    startDate: 'asc'
  }
})
```

**Components**:
- `<EventsCalendar />` - Calendar view
- `<CreateEventModal />` - Create event form
- `<EventCard />` - Event details
- `<RSVPList />` - Attendees list

---

### 13. Reports Dashboard (`/dashboard/principal/reports/page.tsx`)

**Purpose**: Generate and view reports

**Features**:
- Report categories (academic, attendance, financial)
- Pre-built report templates
- Custom report builder
- Export reports (PDF, Excel)
- Schedule automated reports
- Report history

**Report Types**:
- Student performance reports
- Teacher performance reports
- Attendance reports
- Financial reports
- Enrollment reports
- Class reports

**Components**:
- `<ReportCategories />` - Report categories
- `<ReportTemplates />` - Pre-built templates
- `<CustomReportBuilder />` - Build custom reports
- `<ReportViewer />` - View report
- `<ExportOptions />` - Export controls

---

### 14. Analytics Dashboard (`/dashboard/principal/analytics/page.tsx`)

**Purpose**: Comprehensive school analytics

**Features**:
- Student analytics (enrollment trends, performance)
- Teacher analytics (workload, performance)
- Academic analytics (grades, subjects)
- Attendance analytics
- Financial analytics
- Comparative analytics
- Predictive insights

**Components**:
- `<AnalyticsDashboard />` - Main dashboard
- `<EnrollmentTrendsChart />` - Enrollment trends
- `<PerformanceMetrics />` - Performance metrics
- `<ComparativeCharts />` - Comparison charts
- `<InsightsPanel />` - AI insights

---

### 15. School Profile (`/dashboard/principal/school/profile/page.tsx`)

**Purpose**: Manage school information

**Features**:
- View school profile
- Edit school details
- Upload school logo
- Update contact information
- School settings
- Branding customization

**Components**:
- `<SchoolProfileCard />` - School info display
- `<EditSchoolForm />` - Edit form
- `<LogoUploader />` - Logo upload
- `<SchoolSettings />` - Settings panel

---

### 16. Audit Logs (`/dashboard/principal/audit/page.tsx`)

**Purpose**: View system audit logs

**Features**:
- Audit log entries
- Filter by user, action, date
- Search logs
- Export logs
- User activity tracking

**Data Fetching**:
```typescript
const auditLogs = await prisma.auditLog.findMany({
  where: {
    actor: {
      schoolId: currentUser.schoolId
    }
  },
  include: {
    actor: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 100
})
```

**Components**:
- `<AuditLogsTable />` - Logs table
- `<LogFilters />` - Filter controls
- `<LogDetailsModal />` - Log details
- `<ActivityTimeline />` - Activity timeline

---

## Reusable Components

### Core Components

#### 1. `<PrincipalLayout />` - Layout wrapper
```typescript
// src/components/principal/PrincipalLayout.tsx
interface PrincipalLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PrincipalLayout({ children, title, description, actions }: PrincipalLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
```

#### 2. `<StatsCard />` - Metric display card
```typescript
// src/components/principal/StatsCard.tsx
interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  trend?: 'up' | 'down'
  description?: string
}

export function StatsCard({ title, value, change, icon: Icon, trend, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}% from last month
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
```

#### 3. `<DataTableWithActions />` - Enhanced data table
```typescript
// src/components/principal/DataTableWithActions.tsx
interface DataTableWithActionsProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchKey?: string
  filters?: FilterConfig[]
  actions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
}

export function DataTableWithActions<T>({ 
  data, 
  columns, 
  searchKey, 
  filters, 
  actions,
  onRowClick 
}: DataTableWithActionsProps<T>) {
  // Implementation with search, filter, pagination
}
```

#### 4. `<UserCard />` - User profile card
```typescript
// src/components/principal/UserCard.tsx
interface UserCardProps {
  user: User & { profile?: any }
  role: 'TEACHER' | 'STUDENT' | 'PARENT'
  actions?: React.ReactNode
  onClick?: () => void
}

export function UserCard({ user, role, actions, onClick }: UserCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{user.firstName} {user.lastName}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {actions}
        </div>
      </CardHeader>
    </Card>
  )
}
```

#### 5. `<ClassCard />` - Class information card
```typescript
// src/components/principal/ClassCard.tsx
interface ClassCardProps {
  class: Class & {
    subjects: ClassSubject[]
    _count: { enrollments: number }
  }
  onClick?: () => void
}

export function ClassCard({ class: classData, onClick }: ClassCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle>{classData.name}</CardTitle>
        <CardDescription>
          Grade {classData.grade} - Section {classData.section}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Students</span>
            <span className="font-semibold">{classData._count.enrollments}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subjects</span>
            <span className="font-semibold">{classData.subjects.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 6. `<ChartCard />` - Chart wrapper card
```typescript
// src/components/principal/ChartCard.tsx
interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function ChartCard({ title, description, children, actions }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

#### 7. `<QuickActions />` - Quick action buttons
```typescript
// src/components/principal/QuickActions.tsx
interface QuickAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary'
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={action.onClick}
        >
          <action.icon className="h-6 w-6" />
          <span className="text-sm">{action.label}</span>
        </Button>
      ))}
    </div>
  )
}
```

#### 8. `<FilterPanel />` - Advanced filtering
```typescript
// src/components/principal/FilterPanel.tsx
interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'date' | 'text' | 'multiselect'
  options?: { label: string; value: string }[]
}

interface FilterPanelProps {
  filters: FilterConfig[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
  onReset: () => void
}

export function FilterPanel({ filters, values, onChange, onReset }: FilterPanelProps) {
  // Implementation with various filter types
}
```

#### 9. `<EmptyState />` - Empty state display
```typescript
// src/components/principal/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

#### 10. `<ConfirmDialog />` - Confirmation dialog
```typescript
// src/components/principal/ConfirmDialog.tsx
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmDialogProps) {
  // Implementation with AlertDialog
}
```

### Form Components

#### 11. `<AddTeacherForm />` - Add teacher form
#### 12. `<AddStudentForm />` - Add student form
#### 13. `<CreateClassForm />` - Create class form
#### 14. `<CreateSubjectForm />` - Create subject form
#### 15. `<CreateAnnouncementForm />` - Create announcement form
#### 16. `<CreateEventForm />` - Create event form
#### 17. `<AssignTeacherForm />` - Assign teacher to class
#### 18. `<EnrollStudentForm />` - Enroll student in class

### Display Components

#### 19. `<AttendanceChart />` - Attendance visualization
#### 20. `<GradeDistributionChart />` - Grade distribution
#### 21. `<EnrollmentTrendsChart />` - Enrollment trends
#### 22. `<RevenueChart />` - Revenue trends
#### 23. `<PerformanceMetrics />` - Performance metrics
#### 24. `<ActivityFeed />` - Recent activity feed
#### 25. `<NotificationsList />` - Notifications list
#### 26. `<TimetableGrid />` - Timetable grid view

---

## API Routes

### Required API Endpoints

#### User Management
```
GET    /api/principal/users              # Get all users
GET    /api/principal/users/[id]         # Get user details
POST   /api/principal/users              # Create user
PUT    /api/principal/users/[id]         # Update user
DELETE /api/principal/users/[id]         # Deactivate user

GET    /api/principal/teachers           # Get teachers
POST   /api/principal/teachers           # Add teacher
PUT    /api/principal/teachers/[id]      # Update teacher

GET    /api/principal/students           # Get students
POST   /api/principal/students           # Add student
POST   /api/principal/students/bulk      # Bulk import students
PUT    /api/principal/students/[id]      # Update student

GET    /api/principal/parents            # Get parents
POST   /api/principal/parents            # Add parent
```

#### Academic Management
```
GET    /api/principal/classes            # Get classes
POST   /api/principal/classes            # Create class
PUT    /api/principal/classes/[id]       # Update class
DELETE /api/principal/classes/[id]       # Delete class

GET    /api/principal/subjects           # Get subjects
POST   /api/principal/subjects           # Create subject
PUT    /api/principal/subjects/[id]      # Update subject

GET    /api/principal/terms              # Get terms
POST   /api/principal/terms              # Create term
PUT    /api/principal/terms/[id]         # Update term

GET    /api/principal/enrollments        # Get enrollments
POST   /api/principal/enrollments        # Enroll student
DELETE /api/principal/enrollments/[id]   # Remove enrollment
```

#### Assignments & Grades
```
GET    /api/principal/assignments        # Get all assignments
GET    /api/principal/assignments/[id]   # Get assignment details

GET    /api/principal/grades             # Get grades overview
GET    /api/principal/grades/class/[id]  # Get class grades
GET    /api/principal/grades/student/[id] # Get student grades
```

#### Attendance
```
GET    /api/principal/attendance         # Get attendance overview
GET    /api/principal/attendance/class/[id] # Get class attendance
GET    /api/principal/attendance/student/[id] # Get student attendance
GET    /api/principal/attendance/reports # Get attendance reports
```

#### Schedule
```
GET    /api/principal/timetable          # Get timetable
POST   /api/principal/timetable          # Create timetable entry
PUT    /api/principal/timetable/[id]     # Update timetable entry
DELETE /api/principal/timetable/[id]     # Delete timetable entry

GET    /api/principal/periods            # Get periods
POST   /api/principal/periods            # Create period
PUT    /api/principal/periods/[id]       # Update period

GET    /api/principal/rooms              # Get rooms
POST   /api/principal/rooms              # Create room
PUT    /api/principal/rooms/[id]         # Update room
```

#### Communication
```
GET    /api/principal/messages           # Get messages
POST   /api/principal/messages           # Send message
GET    /api/principal/messages/[id]      # Get conversation

GET    /api/principal/announcements      # Get announcements
POST   /api/principal/announcements      # Create announcement
PUT    /api/principal/announcements/[id] # Update announcement
DELETE /api/principal/announcements/[id] # Delete announcement

GET    /api/principal/notifications      # Get notifications
PUT    /api/principal/notifications/[id] # Mark as read
```

#### Events
```
GET    /api/principal/events             # Get events
POST   /api/principal/events             # Create event
PUT    /api/principal/events/[id]        # Update event
DELETE /api/principal/events/[id]        # Delete event
```

#### Financial
```
GET    /api/principal/finance/overview   # Get financial overview
GET    /api/principal/finance/fees       # Get fee records
GET    /api/principal/finance/invoices   # Get invoices
GET    /api/principal/finance/payments   # Get payments
GET    /api/principal/finance/reports    # Get financial reports
```

#### Reports & Analytics
```
GET    /api/principal/reports            # Get available reports
POST   /api/principal/reports/generate   # Generate report
GET    /api/principal/reports/[id]       # Get report

GET    /api/principal/analytics/overview # Get analytics overview
GET    /api/principal/analytics/students # Get student analytics
GET    /api/principal/analytics/teachers # Get teacher analytics
GET    /api/principal/analytics/performance # Get performance analytics
```

#### School Management
```
GET    /api/principal/school             # Get school profile
PUT    /api/principal/school             # Update school profile
POST   /api/principal/school/logo        # Upload school logo

GET    /api/principal/audit-logs         # Get audit logs
```

---

## Summary

The **Principal** role in EduTrack is the most powerful administrative role within a school:

### Key Capabilities
1. **School Creation**: Creates both Clerk Organization and Prisma School record
2. **Full User Management**: Manages teachers, students, parents, and staff
3. **Academic Oversight**: Views all academic data (assignments, grades, attendance)
4. **Administrative Control**: Manages classes, subjects, schedules, and resources
5. **Communication Hub**: Sends announcements and messages to all stakeholders
6. **Financial Oversight**: Views financial reports and fee records
7. **Analytics Access**: Accesses comprehensive school-wide analytics
8. **Audit Trail**: Views all system audit logs

### Integration Points
- **Clerk**: Organization admin role (`org:admin`)
- **Prisma**: User with `role='PRINCIPAL'` and `PrincipalProfile`
- **Permissions**: 50+ granular permissions via `PRINCIPAL_PERMISSIONS`
- **Metadata**: Stored in Clerk's `publicMetadata` for quick access

### Dashboard Scope
- **16 major page sections** covering all administrative functions
- **26+ reusable components** for consistent UI/UX
- **40+ API endpoints** for data management
- **Real-time analytics** and reporting capabilities

This comprehensive system ensures principals have complete visibility and control over their school's operations while maintaining security and data integrity through role-based access control.
