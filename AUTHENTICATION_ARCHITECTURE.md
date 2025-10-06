# Authentication Architecture - Clerk + Prisma

## ✅ Correct Architecture (Current Implementation)

### **Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLERK (Authentication)                    │
│  - Email (unique identifier)                                 │
│  - Password (encrypted, never stored in our DB)              │
│  - First Name                                                │
│  - Last Name                                                 │
│  - Clerk User ID (clerkId)                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    (Webhook Sync & API)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  PRISMA USER MODEL (Identity)                │
│  - id (our internal ID)                                      │
│  - clerkId (links to Clerk)                                  │
│  - email (from Clerk)                                        │
│  - firstName (from Clerk)                                    │
│  - lastName (from Clerk)                                     │
│  - role (STUDENT/TEACHER/PARENT/PRINCIPAL/CLERK/ADMIN)       │
│  - schoolId (organization reference)                         │
│  - isActive (soft delete flag)                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    (One-to-One Relations)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              ROLE-SPECIFIC PROFILES (Extra Data)             │
│                                                              │
│  StudentProfile:                                             │
│    - grade, studentIdNumber, dateOfBirth, etc.               │
│                                                              │
│  TeacherProfile:                                             │
│    - employeeId, department, qualifications, etc.            │
│                                                              │
│  ParentProfile:                                              │
│    - phone, address, emergencyContact, etc.                  │
│                                                              │
│  PrincipalProfile:                                           │
│    - employeeId, qualifications, yearsOfExperience, etc.     │
│                                                              │
│  ClerkProfile:                                               │
│    - employeeId, department, phone, etc.                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Why This Architecture?

### **1. Security**
- ✅ **Passwords never stored in our database** - Clerk handles encryption
- ✅ **Clerk manages session tokens** - automatic refresh, secure storage
- ✅ **Industry-standard OAuth** - supports Google, Microsoft, etc.
- ✅ **Built-in security features** - rate limiting, brute force protection

### **2. Single Source of Truth**
- ✅ **Email/Name in one place** - User model (synced from Clerk)
- ✅ **No data duplication** - role profiles only store role-specific data
- ✅ **Consistent updates** - change name once, reflects everywhere
- ✅ **Referential integrity** - all relationships point to User.id

### **3. Flexibility**
- ✅ **Easy role changes** - update User.role, create new profile
- ✅ **Multi-role support** - user can have multiple profiles (future)
- ✅ **Audit trail** - all actions linked to single User.id
- ✅ **Soft deletes** - deactivate without losing relationships

### **4. Scalability**
- ✅ **Clerk handles auth at scale** - millions of users supported
- ✅ **Efficient queries** - join User with profile as needed
- ✅ **Clean separation** - auth logic vs business logic
- ✅ **Easy to extend** - add new roles without schema changes

## 📝 Registration Flow

### **Step 1: Clerk Authentication**
```typescript
// User signs up via Clerk component
<SignUp />

// Clerk captures:
- email: "student@school.com"
- password: "encrypted_by_clerk" (never in our DB)
- firstName: "John"
- lastName: "Doe"
- clerkId: "user_2abc123xyz"
```

### **Step 2: Role Selection**
```typescript
// User selects role in our custom form
selectedRole = "STUDENT"
```

### **Step 3: Profile Information**
```typescript
// User fills role-specific data
profileData = {
  grade: "10th Grade",
  studentIdNumber: "STU001",
  dateOfBirth: "2008-05-15",
  // ... other student fields
}
```

### **Step 4: School Selection**
```typescript
// User selects their school (Clerk organization)
selectedSchool = {
  id: "org_abc123",
  name: "Demo High School"
}
```

### **Step 5: Database Creation**
```typescript
// API creates User + Profile
await prisma.user.create({
  data: {
    clerkId: user.id,              // From Clerk
    email: user.email,             // From Clerk
    firstName: user.firstName,     // From Clerk
    lastName: user.lastName,       // From Clerk
    role: "STUDENT",               // From form
    schoolId: selectedSchool.id,   // From form
    studentProfile: {
      create: {
        grade: "10th Grade",       // From form
        studentIdNumber: "STU001", // From form
        // ... other fields
      }
    }
  }
})
```

## 🚫 Why NOT Store Name/Email in Profiles?

### **Problem 1: Data Duplication**
```typescript
// ❌ BAD: Data in multiple places
StudentProfile {
  name: "John Doe"
  email: "john@school.com"
  grade: "10th"
}

TeacherProfile {
  name: "John Doe"  // Same person, different role
  email: "john@school.com"
  department: "Math"
}

// What if John changes his name? Update both tables!
```

### **Problem 2: No Password Storage**
```typescript
// ❌ IMPOSSIBLE: Cannot store passwords securely
StudentProfile {
  email: "john@school.com"
  password: "???" // How to encrypt? How to validate?
}

// Clerk handles this with:
// - Bcrypt/Argon2 hashing
// - Salt generation
// - Password policies
// - Breach detection
```

### **Problem 3: Broken Relationships**
```typescript
// ❌ BAD: All relationships break
Message {
  senderId: "???" // Which table? StudentProfile? TeacherProfile?
}

Assignment {
  createdById: "???" // Cannot reference multiple tables
}

// With User model:
Message {
  senderId: User.id // ✅ Always works
}
```

### **Problem 4: Role Changes**
```typescript
// ❌ BAD: Teacher becomes Principal
// 1. Copy all data from TeacherProfile to PrincipalProfile
// 2. Update all foreign keys pointing to TeacherProfile
// 3. Delete TeacherProfile
// 4. Lose all history

// ✅ GOOD: With User model
// 1. Update User.role = "PRINCIPAL"
// 2. Create PrincipalProfile
// 3. Keep TeacherProfile for history (optional)
```

## ✅ Current Implementation

### **User Model (Core Identity)**
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique        // Links to Clerk
  email     String   @unique        // From Clerk
  firstName String                  // From Clerk
  lastName  String                  // From Clerk
  role      UserRole                // Our business logic
  schoolId  String                  // Organization reference
  
  // One-to-one with profiles
  studentProfile   StudentProfile?
  teacherProfile   TeacherProfile?
  parentProfile    ParentProfile?
  principalProfile PrincipalProfile?
  clerkProfile     ClerkProfile?
  
  // All relationships point here
  messages         Message[]
  assignments      Assignment[]
  grades           Grade[]
  // ... 50+ other relations
}
```

### **Profile Models (Role-Specific Data)**
```prisma
model StudentProfile {
  id        String @id @default(cuid())
  studentId String @unique
  student   User   @relation(fields: [studentId], references: [id])
  
  // ONLY student-specific fields
  grade            String?
  studentIdNumber  String?
  dateOfBirth      DateTime?
  emergencyContact String?
  medicalInfo      String?
  address          String?
}

model TeacherProfile {
  id        String @id @default(cuid())
  teacherId String @unique
  teacher   User   @relation(fields: [teacherId], references: [id])
  
  // ONLY teacher-specific fields
  employeeId     String?
  department     String?
  qualifications String?
  hireDate       DateTime?
  salary         Float?
}
```

## 📊 Data Access Patterns

### **Get User with Profile**
```typescript
const user = await prisma.user.findUnique({
  where: { clerkId: session.userId },
  include: {
    studentProfile: true,  // If student
    teacherProfile: true,  // If teacher
    school: true,          // Always include
  }
})

// Access data:
const fullName = `${user.firstName} ${user.lastName}` // From User
const email = user.email                               // From User
const grade = user.studentProfile?.grade               // From Profile
const school = user.school.name                        // From School
```

### **Display User Info**
```typescript
// In dashboard
<div>
  <h1>Welcome, {user.firstName}!</h1>  {/* From Clerk/User */}
  <p>Email: {user.email}</p>           {/* From Clerk/User */}
  <p>Role: {user.role}</p>             {/* From User */}
  
  {user.role === 'STUDENT' && (
    <p>Grade: {user.studentProfile.grade}</p>  {/* From Profile */}
  )}
  
  {user.role === 'TEACHER' && (
    <p>Department: {user.teacherProfile.department}</p>  {/* From Profile */}
  )}
</div>
```

### **Update User Info**
```typescript
// Update name (via Clerk API)
await clerkClient.users.updateUser(userId, {
  firstName: "Jane",
  lastName: "Smith"
})
// Webhook automatically syncs to User table

// Update profile (via our API)
await prisma.studentProfile.update({
  where: { studentId: user.id },
  data: { grade: "11th Grade" }
})
```

## 🎯 Best Practices

### **DO ✅**
- Store authentication data in Clerk (email, password, name)
- Store identity data in User model (clerkId, role, schoolId)
- Store role-specific data in profile models (grade, department, etc.)
- Use User.id for all foreign key relationships
- Sync Clerk → User via webhooks
- Display Clerk data as read-only in forms

### **DON'T ❌**
- Store passwords in Prisma database
- Duplicate email/name in profile models
- Create separate auth systems
- Use profile IDs for relationships
- Ask users to re-enter Clerk-managed data
- Mix authentication with business logic

## 📚 Summary

**The current architecture is correct and follows industry best practices:**

1. **Clerk** = Authentication (email, password, name)
2. **User Model** = Identity (clerkId, role, schoolId)
3. **Profile Models** = Role-specific data (grade, department, etc.)

This provides:
- ✅ Security (Clerk handles passwords)
- ✅ Consistency (single source of truth)
- ✅ Flexibility (easy role changes)
- ✅ Scalability (clean separation of concerns)
- ✅ Maintainability (standard patterns)

**Do not modify this architecture** - it is designed for long-term success and security.
