# Authentication & Authorization Implementation

## Overview
This document describes the comprehensive role-based authentication and authorization system implemented in EduTrack.

## Architecture

### Components
1. **Clerk Authentication** - Third-party auth provider for user management
2. **Prisma Database** - User data and role storage
3. **Auth Utilities** (`/src/lib/auth.ts`) - Helper functions for auth checks
4. **Middleware** (`/src/middleware.ts`) - Route protection
5. **API Routes** - Role-based access control
6. **UI Components** - Role-aware interfaces

## User Roles

### Available Roles
- **STUDENT** - Learners enrolled in the school
- **TEACHER** - Instructors teaching classes
- **PARENT** - Guardians of students
- **PRINCIPAL** - School administrators
- **CLERK** - Administrative staff
- **ADMIN** - System administrators (super users)

### Role Hierarchy
```
ADMIN (highest)
  ├── PRINCIPAL
  │   ├── TEACHER
  │   ├── CLERK
  │   ├── STUDENT
  │   └── PARENT
```

## Authentication Flow

### Sign Up Process
1. User visits `/sign-up`
2. Selects role (STUDENT, TEACHER, PARENT, PRINCIPAL, SCHOOL/CLERK)
3. Fills role-specific profile information
4. Selects or creates school
5. Clerk creates authentication account
6. Webhook syncs user data to database
7. User redirected to role-specific dashboard

### Sign In Process
1. User visits `/sign-in`
2. Authenticates with Clerk
3. System fetches user data from `/api/users/me`
4. User redirected to role-specific dashboard based on their role
5. Dashboard route determined by `getDashboardRoute()` function

### Dashboard Routes by Role
- **STUDENT**: `/dashboard/student`
- **TEACHER**: `/dashboard/teacher`
- **PARENT**: `/dashboard/parent`
- **PRINCIPAL**: `/dashboard/principal`
- **CLERK**: `/dashboard/clerk`
- **ADMIN**: `/dashboard/admin`

## Authorization System

### Permission Model
Each role has specific permissions defined in `PERMISSIONS` object:

#### Student Permissions
- View own grades
- View own attendance
- Submit assignments
- View own schedule
- Access resources
- Send messages
- View own fees

#### Teacher Permissions
- Manage grades
- Manage attendance
- Create assignments
- Manage lesson plans
- View class analytics
- Manage resources
- Message parents and students
- View schedule

#### Parent Permissions
- View child grades
- View child attendance
- View child assignments
- Message teachers
- View child schedule
- View child fees
- Make payments

#### Principal Permissions
- Manage staff
- View all analytics
- Manage classes and subjects
- Manage terms
- View financials
- Manage events
- Create announcements
- Access audit logs
- Manage schedule

#### Clerk Permissions
- Manage students
- Manage enrollments
- Manage fees
- Process payments
- Manage attendance
- Generate reports
- Manage inventory
- View financials

#### Admin Permissions
- Manage schools
- Manage all users
- Access all data
- Manage system
- View audit logs
- Manage permissions

### Auth Helper Functions

#### `getCurrentUser()`
Fetches the authenticated user with all profile data and school information.

```typescript
const user = await getCurrentUser()
if (!user) {
  // Not authenticated
}
```

#### `hasRole(role)`
Checks if user has a specific role.

```typescript
const isTeacher = await hasRole('TEACHER')
const isStaffMember = await hasRole(['TEACHER', 'PRINCIPAL', 'CLERK'])
```

#### `requireAuth()`
Requires authentication, throws error if not authenticated.

```typescript
const user = await requireAuth() // Throws if not authenticated
```

#### `requireRole(role)`
Requires specific role, throws error if user doesn't have it.

```typescript
const user = await requireRole('PRINCIPAL') // Throws if not principal
const user = await requireRole(['TEACHER', 'PRINCIPAL']) // Throws if neither
```

#### `hasPermission(permission)`
Checks if user has a specific permission.

```typescript
const canManageGrades = await hasPermission('canManageGrades')
```

#### `belongsToSchool(schoolId)`
Checks if user belongs to a specific school.

```typescript
const hasAccess = await belongsToSchool(schoolId)
```

#### `canManageUser(targetUserId)`
Checks if current user can manage another user.

```typescript
const canManage = await canManageUser(studentId)
```

## Middleware Protection

### Route Protection
The middleware (`/src/middleware.ts`) handles:
- Authentication checks
- Redirect to sign-in for unauthenticated users
- Public route access
- Protected route enforcement

### Public Routes
- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/api/webhooks` - Webhook endpoints
- `/unauthorized` - Access denied page

### Protected Routes
All routes under:
- `/dashboard/*`
- `/setup-school`
- `/api/*` (except webhooks)

## API Route Protection

### Example: Protected API Route
```typescript
import { requireAuth, requireRole } from '@/lib/auth'

export async function GET() {
  // Require authentication
  const user = await requireAuth()
  
  // Require specific role
  await requireRole('TEACHER')
  
  // Your logic here
}
```

### Example: School-Scoped API Route
```typescript
import { validateSchoolAccess } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const schoolId = searchParams.get('schoolId')
  
  // Validate user belongs to school (or is admin)
  const user = await validateSchoolAccess(schoolId)
  
  // Your logic here
}
```

## UI Components

### Role-Based Rendering
```typescript
import { getCurrentUser } from '@/lib/auth'

export default async function Page() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return (
    <div>
      {user.role === 'TEACHER' && <TeacherView />}
      {user.role === 'STUDENT' && <StudentView />}
      {/* etc */}
    </div>
  )
}
```

### Permission-Based Rendering
```typescript
import { hasPermission } from '@/lib/auth'

export default async function Page() {
  const canManageGrades = await hasPermission('canManageGrades')
  
  return (
    <div>
      {canManageGrades && <GradeManagementPanel />}
    </div>
  )
}
```

## Webhook Integration

### Clerk Webhook Handler
Located at `/api/webhooks/clerk/route.ts`

Handles:
- `user.created` - Syncs new Clerk user to database
- `user.updated` - Updates user information
- `user.deleted` - Soft deletes user (sets isActive = false)

### Webhook Setup
1. Configure webhook URL in Clerk Dashboard
2. Add `CLERK_WEBHOOK_SECRET` to environment variables
3. Webhook automatically syncs user data

## Security Best Practices

### Implemented Security Measures
1. **Authentication Required** - All protected routes require valid Clerk session
2. **Role-Based Access** - Users can only access features for their role
3. **School Scoping** - Users can only access data from their school (except admins)
4. **Permission Checks** - Fine-grained permission system
5. **Audit Logging** - All critical actions logged
6. **Soft Deletes** - Users are deactivated, not deleted
7. **Input Validation** - Zod schemas validate all inputs
8. **CSRF Protection** - Clerk handles CSRF tokens
9. **Session Management** - Clerk manages secure sessions

### Additional Recommendations
1. Enable MFA in Clerk for sensitive roles
2. Implement rate limiting on API routes
3. Add IP whitelisting for admin routes
4. Regular security audits
5. Monitor audit logs for suspicious activity

## Error Handling

### Unauthorized Access
Users without proper authentication are redirected to `/sign-in`

### Forbidden Access
Users without proper permissions see `/unauthorized` page with:
- Current user information
- Role display
- Reason for denial
- Actions to take

### API Errors
API routes return appropriate HTTP status codes:
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Testing

### Test Scenarios
1. **Authentication**
   - Sign up with different roles
   - Sign in and verify redirect
   - Sign out and verify session cleared

2. **Authorization**
   - Access role-specific dashboards
   - Attempt to access unauthorized routes
   - Verify permission checks work

3. **School Scoping**
   - Verify users can only see their school data
   - Test admin access to multiple schools
   - Test cross-school access denial

4. **API Protection**
   - Call APIs without authentication
   - Call APIs with wrong role
   - Verify proper error responses

## Future Enhancements

### Planned Features
1. **Multi-Role Support** - Users with multiple roles
2. **Custom Permissions** - School-specific permission overrides
3. **Temporary Access** - Time-limited permissions
4. **Delegation** - Principals delegate permissions to teachers
5. **2FA Enforcement** - Require 2FA for sensitive roles
6. **Session Timeout** - Configurable session expiration
7. **Login History** - Track user login activity
8. **Device Management** - Manage trusted devices

## Troubleshooting

### Common Issues

#### User Not Found After Sign Up
- Check webhook is configured correctly
- Verify `CLERK_WEBHOOK_SECRET` is set
- Check webhook logs in Clerk Dashboard

#### Redirect Loop
- Clear browser cookies
- Check middleware configuration
- Verify Clerk environment variables

#### Permission Denied
- Verify user role is correct in database
- Check permission definitions in `PERMISSIONS`
- Verify school association

#### Dashboard Not Loading
- Check user has completed profile setup
- Verify school assignment
- Check role-specific dashboard route exists

## Environment Variables

Required environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=postgresql://...
```

## Support

For issues or questions:
1. Check this documentation
2. Review Clerk documentation
3. Check application logs
4. Contact development team

---

**Last Updated**: 2025-10-06  
**Version**: 1.0.0  
**Author**: EduTrack Development Team
