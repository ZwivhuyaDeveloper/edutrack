# 🔐 Complete Authentication & Authorization System

## ✅ System Overview

Your EduTrack application now has a comprehensive, production-ready authentication and authorization system with:

1. **Clerk Authentication** - User sign-up/sign-in
2. **Role-Based Access Control (RBAC)** - 6 distinct roles
3. **Organization Management** - School-based organizations
4. **Permission System** - Granular resource permissions
5. **Middleware Protection** - Route-level security
6. **API Helpers** - Easy auth checks in routes
7. **Metadata System** - Permission storage in Clerk

---

## 📁 Files Created/Modified

### Core Files:
1. **`src/lib/permissions.ts`** - Permission definitions (40+ resources, 6 roles)
2. **`src/lib/auth-helpers.ts`** - API route authentication helpers
3. **`src/middleware.ts`** - Route protection middleware
4. **`prisma/schema.prisma`** - Added `clerkOrganizationId` to School
5. **`src/app/api/schools/route.ts`** - Creates Clerk organizations
6. **`src/app/api/users/route.ts`** - Adds users to organizations with metadata
7. **`src/app/unauthorized/page.tsx`** - Access denied page

### Documentation:
- **`PERMISSIONS_SUMMARY.md`** - Quick reference
- **`PRISMA_ACCESS_PATTERNS.md`** - Database query patterns
- **`CLERK_ORGANIZATION_INTEGRATION.md`** - Setup guide

---

## 🎭 The 6 Roles

| Role | Clerk Org Role | Description |
|------|---------------|-------------|
| **STUDENT** | `org:student` | View own academic data, submit assignments |
| **TEACHER** | `org:teacher` | Manage classes, grade students, create content |
| **PARENT** | `org:parent` | View children's data, communicate with teachers |
| **PRINCIPAL** | `org:admin` | Full school management, view all data |
| **CLERK** | `org:clerk` | Student records, financial management |
| **ADMIN** | `org:super_admin` | Full system access across all schools |

---

## 🔄 Complete User Flow

### 1. Principal Creates School
```
User → Sign Up (Clerk) → Complete Profile → Create School
  ↓
System Creates:
  - Clerk Organization (org_abc123)
  - School in Database (linked to org)
  - Principal as org:admin
  - Metadata with PRINCIPAL permissions
```

### 2. Student/Teacher/Parent Registers
```
User → Sign Up (Clerk) → Select Role → Fill Profile → Select School
  ↓
System:
  - Adds to School's Clerk Organization
  - Assigns role-based org role
  - Sets metadata with permissions
  - Creates database record
  - Redirects to dashboard
```

### 3. User Accesses Dashboard
```
Request → Middleware Checks:
  1. Is authenticated? (Clerk)
  2. Has role in metadata?
  3. Role matches route?
  ↓
If YES → Allow access
If NO → Redirect to /unauthorized
```

---

## 🛡️ Middleware Protection

### Routes Protected:
```typescript
// Public (no auth required)
- /
- /sign-in
- /sign-up

// Protected (auth required)
- /dashboard/*
- /setup-school
- /api/* (except webhooks)

// Role-specific
- /dashboard/principal/* → PRINCIPAL only
- /dashboard/teacher/* → TEACHER only
- /dashboard/learner/* → STUDENT only
- /dashboard/parent/* → PARENT only
- /dashboard/clerk/* → CLERK only
- /dashboard/admin/* → ADMIN only
```

### Middleware Checks:
1. ✅ Authentication (Clerk userId)
2. ✅ Role from metadata
3. ✅ Route-role matching
4. ✅ Redirects to /unauthorized if mismatch

---

## 🔧 Using Auth Helpers in API Routes

### Example 1: Require Authentication
```typescript
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error
  
  // user is authenticated
  return NextResponse.json({ user })
}
```

### Example 2: Require Specific Role
```typescript
import { requireRole } from '@/lib/auth-helpers'

export async function POST() {
  const { user, error } = await requireRole('TEACHER')
  if (error) return error
  
  // user is a teacher
  return NextResponse.json({ success: true })
}
```

### Example 3: Require Permission
```typescript
import { requirePermission, Resource, PermissionAction } from '@/lib/auth-helpers'

export async function POST() {
  const { user, error } = await requirePermission(
    Resource.ASSIGNMENTS,
    PermissionAction.CREATE
  )
  if (error) return error
  
  // user can create assignments
  return NextResponse.json({ success: true })
}
```

### Example 4: Check School Access
```typescript
import { requireSameSchool } from '@/lib/auth-helpers'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: { class: { include: { school: true } } }
  })
  
  const { user, error } = await requireSameSchool(assignment.class.schoolId)
  if (error) return error
  
  // user is from same school
  return NextResponse.json({ assignment })
}
```

### Example 5: Teacher Owns Class
```typescript
import { requireTeacherOwnsClass } from '@/lib/auth-helpers'

export async function POST(req: Request) {
  const { classId } = await req.json()
  
  const { user, error } = await requireTeacherOwnsClass(classId)
  if (error) return error
  
  // teacher teaches this class
  return NextResponse.json({ success: true })
}
```

### Example 6: Parent Access to Child
```typescript
import { requireParentOfStudent } from '@/lib/auth-helpers'

export async function GET(req: Request, { params }: { params: { studentId: string } }) {
  const { user, error } = await requireParentOfStudent(params.studentId)
  if (error) return error
  
  // parent has access to this student
  const grades = await prisma.grade.findMany({
    where: { studentId: params.studentId }
  })
  
  return NextResponse.json({ grades })
}
```

---

## 🔍 Checking Permissions in Components

### Client-Side Permission Check
```typescript
'use client'
import { useUser } from '@clerk/nextjs'
import { hasPermission, Resource, PermissionAction } from '@/lib/permissions'

export function MyComponent() {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as string
  
  const canCreateAssignment = hasPermission(
    userRole,
    Resource.ASSIGNMENTS,
    PermissionAction.CREATE
  )
  
  return (
    <div>
      {canCreateAssignment && (
        <Button>Create Assignment</Button>
      )}
    </div>
  )
}
```

### Server Component Permission Check
```typescript
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { hasPermission, Resource, PermissionAction } from '@/lib/permissions'

export default async function Page() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  const canManageClasses = hasPermission(
    user.role,
    Resource.CLASSES,
    PermissionAction.MANAGE
  )
  
  return (
    <div>
      {canManageClasses && <ClassManagementPanel />}
    </div>
  )
}
```

---

## 📊 Permission Matrix

### STUDENT Permissions
- ✅ View own profile, classes, schedule
- ✅ Submit assignments
- ✅ View own grades
- ✅ View class resources
- ❌ Create/modify grades
- ❌ Manage classes

### TEACHER Permissions
- ✅ Manage own classes
- ✅ Create and grade assignments
- ✅ Record attendance
- ✅ Create lesson plans
- ✅ View students in their classes
- ❌ Access other teachers' classes
- ❌ Modify school settings

### PARENT Permissions
- ✅ View all children's data
- ✅ View grades, assignments, attendance
- ✅ Communicate with teachers
- ✅ Pay fees
- ❌ Modify academic records
- ❌ Access other students' data

### PRINCIPAL Permissions
- ✅ Full school management
- ✅ Manage users, classes, subjects
- ✅ View all data (read-only for grades)
- ✅ Create announcements
- ✅ Generate reports
- ❌ Modify individual grades directly

### CLERK Permissions
- ✅ Manage student records
- ✅ Full financial management
- ✅ Record attendance
- ✅ Generate reports
- ❌ Create/modify grades
- ❌ Access teacher lesson plans

### ADMIN Permissions
- ✅ Full system access
- ✅ Manage all schools
- ✅ Access all data
- ✅ System configuration

---

## 🔒 Security Features

### 1. School Isolation
```typescript
// All queries filtered by school
where: { schoolId: user.schoolId }
```

### 2. Role-Based Routes
```typescript
// Middleware blocks unauthorized role access
if (isPrincipalRoute(req) && userRole !== 'PRINCIPAL') {
  return redirect('/unauthorized')
}
```

### 3. Permission Checks
```typescript
// API routes verify permissions
if (!hasPermission(user.role, Resource.GRADES, PermissionAction.CREATE)) {
  return 403 Forbidden
}
```

### 4. Relationship-Based Access
```typescript
// Teachers only access their classes
where: { classSubject: { teacherId: user.id } }

// Parents only access their children
where: { studentId: { in: childIds } }
```

### 5. Clerk Organization
```typescript
// Users automatically added to school organization
// Organization roles enforce access at Clerk level
```

---

## 🚀 Testing the System

### Test 1: Principal Creates School
1. Sign up as new user
2. Select PRINCIPAL role
3. Complete school setup
4. ✅ Check Clerk Dashboard - organization created
5. ✅ Check database - school has `clerkOrganizationId`
6. ✅ Principal is `org:admin`

### Test 2: Student Joins School
1. Sign up as new user
2. Select STUDENT role
3. Select the principal's school
4. ✅ Check Clerk Dashboard - student added to organization
5. ✅ Student is `org:student`
6. ✅ Metadata includes STUDENT permissions

### Test 3: Role-Based Access
1. Login as STUDENT
2. Try to access `/dashboard/principal`
3. ✅ Redirected to `/unauthorized`
4. Access `/dashboard/learner`
5. ✅ Allowed access

### Test 4: Permission Check
1. Login as TEACHER
2. Try to create assignment for own class
3. ✅ Allowed (has permission)
4. Try to modify school settings
5. ✅ Blocked (no permission)

---

## 📝 Next Steps

Your authentication system is complete and production-ready! You can now:

1. ✅ Build role-specific dashboards
2. ✅ Create protected API endpoints
3. ✅ Implement feature-specific permissions
4. ✅ Add audit logging
5. ✅ Customize permission rules as needed

---

## 🆘 Troubleshooting

### User can't access dashboard
- Check if user has role in Clerk metadata
- Verify user completed registration flow
- Check if `isActive` is true in database

### Permission denied errors
- Verify role has required permission in `permissions.ts`
- Check if user belongs to correct school
- Ensure Clerk metadata is up to date

### Organization not created
- Check Clerk API keys in `.env`
- Verify Clerk organization creation in logs
- Manually create organization if needed

---

**System Status: ✅ COMPLETE & PRODUCTION READY**
