# 🔐 Permissions & Access Control - Quick Reference

## ✅ Implementation Complete

### Files Created:
1. **`src/lib/permissions.ts`** - Complete permission system
2. **`PRISMA_ACCESS_PATTERNS.md`** - Database access patterns by role
3. **`CLERK_ORGANIZATION_INTEGRATION.md`** - Clerk integration guide

### Database Updated:
- Added `clerkOrganizationId` to School model
- Run: `npx prisma db push` ✅ (Already done)

---

## 🎭 Role Permissions Summary

| Role | Clerk Org Role | Key Permissions |
|------|---------------|-----------------|
| **STUDENT** | `org:student` | View own data, submit assignments, view grades |
| **TEACHER** | `org:teacher` | Manage classes, grade students, create content |
| **PARENT** | `org:parent` | View children's data, pay fees, message teachers |
| **PRINCIPAL** | `org:admin` | Full school management, view all data |
| **CLERK** | `org:clerk` | Student records, financial management |
| **ADMIN** | `org:super_admin` | Full system access |

---

## 🔄 How It Works

### When Principal Creates School:
```
1. Clerk organization created
2. Principal added as org:admin
3. Metadata set with PRINCIPAL permissions
4. School stored with clerkOrganizationId
```

### When User Registers:
```
1. User added to school's Clerk organization
2. Role-based org role assigned (org:student, org:teacher, etc.)
3. Metadata updated with:
   - role
   - schoolId
   - permissions array
   - isActive status
4. Database record created
```

---

## 📝 Usage Examples

### Check Permission in Code:
```typescript
import { hasPermission, Resource, PermissionAction } from '@/lib/permissions'

// Check if user can create assignments
if (hasPermission(user.role, Resource.ASSIGNMENTS, PermissionAction.CREATE)) {
  // Allow
}
```

### Access User Metadata:
```typescript
const { publicMetadata } = await clerkClient().users.getUser(userId)
const permissions = publicMetadata.permissions // Array of permission strings
const schoolId = publicMetadata.schoolId
const role = publicMetadata.role
```

### Prisma Query with Isolation:
```typescript
// Student - own data only
where: { studentId: user.id }

// Teacher - own classes only
where: { classSubject: { teacherId: user.id } }

// Parent - children only
where: { studentId: { in: childIds } }

// Principal - school-wide
where: { schoolId: user.schoolId }
```

---

## 🔒 Security Features

✅ **School Isolation** - Users only access their school's data
✅ **Role-Based Access** - Permissions enforced at API and UI level
✅ **Clerk Organization** - Centralized access control
✅ **Metadata Permissions** - Permission strings stored in Clerk
✅ **Relationship-Based** - Access based on data relationships

---

## 📚 Documentation Files

1. **`src/lib/permissions.ts`** - Permission definitions and helpers
2. **`PRISMA_ACCESS_PATTERNS.md`** - Detailed Prisma queries by role
3. **`CLERK_ORGANIZATION_INTEGRATION.md`** - Clerk setup guide

---

## 🚀 Next Steps

1. ✅ Database schema updated
2. ✅ Permission system implemented
3. ✅ Clerk integration complete
4. ✅ Metadata system configured

**Ready to use!** All new registrations will automatically:
- Join the school's Clerk organization
- Get role-based permissions
- Have metadata set correctly
