# ❌ Schema Validation Issues Found

## 🚨 **Critical Issue: Invalid SCHOOL Role**

### **Problem:**
The sign-up page and API routes reference a `SCHOOL` role that **DOES NOT EXIST** in the Prisma schema.

### **Prisma Schema (Valid Roles):**
```prisma
enum UserRole {
  STUDENT
  TEACHER
  PARENT
  PRINCIPAL
  CLERK      // ✅ This is the correct role for school administrators
  ADMIN
}
```

### **Sign-Up Page (Invalid Role):**
```typescript
// ❌ WRONG - SCHOOL is not a valid role
const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'SCHOOL'>('STUDENT')

// ❌ WRONG - SCHOOL role doesn't exist in schema
if (role === 'SCHOOL') {
  setStep('school-setup')
}
```

### **API Routes (Invalid Role):**
```typescript
// ❌ WRONG - SCHOOL is not a valid role
if (!['PRINCIPAL', 'SCHOOL'].includes(currentUser.role)) {
  return forbidden()
}
```

---

## ✅ **Correct Implementation**

### **According to Schema:**
- **CLERK** role = School administrative staff (handles fees, payments, records)
- **PRINCIPAL** role = School principal/head (manages school operations)
- **ADMIN** role = System administrator (super user)

### **For School Creation:**
Only **PRINCIPAL** should be able to create schools (not SCHOOL or CLERK)

---

## 🔧 **Required Fixes**

### **1. Sign-Up Page**
```typescript
// ✅ CORRECT
const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'CLERK'>('STUDENT')

// Remove SCHOOL role option from UI
// Add CLERK role option instead
```

### **2. API Routes**
```typescript
// ✅ CORRECT - Only PRINCIPAL can create schools
if (currentUser && currentUser.role !== 'PRINCIPAL') {
  return NextResponse.json({ 
    error: 'Only principals can create schools' 
  }, { status: 403 })
}
```

### **3. Type Definitions**
All TypeScript types must match the Prisma schema:
```typescript
type UserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'CLERK' | 'ADMIN'
```

---

## 📋 **Files That Need Updates**

1. ✅ `/api/schools/route.ts` - Remove SCHOOL role check
2. ✅ `/api/organizations/route.ts` - Remove SCHOOL role check  
3. ❌ `/app/sign-up/[[...sign-up]]/page.tsx` - Remove SCHOOL, add CLERK
4. ❌ All type definitions referencing SCHOOL role

---

## 🎯 **Correct Role Permissions**

| Role | Can Create School | Can Create Users | Can Manage Fees |
|------|-------------------|------------------|-----------------|
| STUDENT | ❌ | ❌ | ❌ |
| TEACHER | ❌ | ❌ | ❌ |
| PARENT | ❌ | ❌ | ❌ |
| PRINCIPAL | ✅ | ✅ | ✅ |
| CLERK | ❌ | ❌ | ✅ |
| ADMIN | ✅ | ✅ | ✅ |

---

**Status:** ❌ **Critical - Must Fix Before Production**
