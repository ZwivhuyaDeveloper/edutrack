# Complete Sign-Up Flow

## 📋 Overview

The sign-up process is a **multi-step flow** that combines **Clerk authentication** with **custom profile setup**.

## 🔄 Step-by-Step Flow

### **Step 1: Clerk Authentication** 
**Page: `/sign-up` (when user is NOT authenticated)**

```
┌─────────────────────────────────────────┐
│         Clerk SignUp Component          │
│                                         │
│  📧 Email: [________________]           │
│  🔒 Password: [________________]        │
│  👤 First Name: [________________]      │
│  👤 Last Name: [________________]       │
│                                         │
│  [Create Account Button]                │
│                                         │
│  ✅ Clerk handles:                      │
│     - Email validation                  │
│     - Password encryption               │
│     - Email verification                │
│     - Session creation                  │
└─────────────────────────────────────────┘
                    ↓
            Account Created!
         (User is now authenticated)
                    ↓
```

### **Step 2: Role Selection**
**Page: `/sign-up` (when user IS authenticated)**

```
┌─────────────────────────────────────────┐
│          Choose Your Role               │
│                                         │
│  🎓 [Student/Learner]                   │
│  👨‍👩‍👧 [Parent/Guardian]                   │
│  📚 [Teacher]                           │
│  🏛️ [Principal/Admin]                   │
│  🏢 [School Administrator]              │
│                                         │
│  User selects: STUDENT                  │
└─────────────────────────────────────────┘
                    ↓
```

### **Step 3: Profile Information**
**Page: `/sign-up` (profile step)**

```
┌─────────────────────────────────────────┐
│      Student Information                │
│                                         │
│  ℹ️ Account Info (from Clerk):          │
│     Name: John Doe                      │
│     Email: john@school.com              │
│                                         │
│  📝 Student Details:                    │
│     Grade: [10th Grade]                 │
│     Student ID: [STU001]                │
│     Date of Birth: [2008-05-15]         │
│     Address: [123 Main St]              │
│     Emergency Contact: [Parent Phone]   │
│                                         │
│  [Continue to School Selection]         │
└─────────────────────────────────────────┘
                    ↓
```

### **Step 4: School Selection**
**Page: `/sign-up` (school step)**

```
┌─────────────────────────────────────────┐
│        Select Your School               │
│                                         │
│  🔍 [Search schools...]                 │
│                                         │
│  📚 Demo High School                    │
│     Springfield, IL                     │
│     150 users                           │
│     [✓ Selected]                        │
│                                         │
│  📚 Another School                      │
│     City, State                         │
│     75 users                            │
│     [ ] Select                          │
│                                         │
│  [Complete Registration]                │
└─────────────────────────────────────────┘
                    ↓
```

### **Step 5: Database Creation**
**Backend: API creates user profile**

```
┌─────────────────────────────────────────┐
│       Creating Your Profile...          │
│                                         │
│  1. ✅ Join school organization (Clerk) │
│  2. ✅ Create User record (Prisma)      │
│  3. ✅ Create Student profile (Prisma)  │
│  4. ✅ Link to school                   │
│                                         │
│  Success! Redirecting to dashboard...   │
└─────────────────────────────────────────┘
                    ↓
            Dashboard (Student)
```

## 🎯 What Gets Collected Where

### **Clerk Collects (Step 1)**
```javascript
{
  email: "john@school.com",
  password: "encrypted_by_clerk", // Never in our DB
  firstName: "John",
  lastName: "Doe",
  clerkId: "user_2abc123xyz"
}
```

### **Custom Forms Collect (Steps 2-4)**
```javascript
{
  role: "STUDENT",              // Step 2
  schoolId: "org_abc123",       // Step 4
  studentProfile: {             // Step 3
    grade: "10th Grade",
    studentIdNumber: "STU001",
    dateOfBirth: "2008-05-15",
    address: "123 Main St",
    emergencyContact: "Parent: (555) 123-4567"
  }
}
```

### **Final Database Record (Step 5)**
```javascript
// User table
{
  id: "cuid_xyz",
  clerkId: "user_2abc123xyz",  // From Clerk
  email: "john@school.com",    // From Clerk
  firstName: "John",           // From Clerk
  lastName: "Doe",             // From Clerk
  role: "STUDENT",             // From form
  schoolId: "org_abc123",      // From form
}

// StudentProfile table
{
  id: "cuid_abc",
  studentId: "cuid_xyz",       // Links to User
  grade: "10th Grade",         // From form
  studentIdNumber: "STU001",   // From form
  dateOfBirth: "2008-05-15",   // From form
  address: "123 Main St",      // From form
  emergencyContact: "..."      // From form
}
```

## 🔐 Login Flow (After Sign-Up)

### **User Returns to Site**

```
1. User visits /sign-in
   ↓
2. Clerk SignIn component shown
   ↓
3. User enters email + password
   ↓
4. Clerk validates credentials
   ↓
5. Session created
   ↓
6. Fetch user profile from /api/users/me
   ↓
7. Redirect to role-based dashboard
```

**Login Form (Clerk provides):**
```
┌─────────────────────────────────────────┐
│           Sign In to EduTrack           │
│                                         │
│  📧 Email: [________________]           │
│  🔒 Password: [________________]        │
│                                         │
│  [Sign In Button]                       │
│                                         │
│  Forgot password? | Sign up             │
└─────────────────────────────────────────┘
```

## 🔄 Principal Flow (Special Case)

### **Principal Creating New School**

```
Step 1: Clerk Authentication ✅
   ↓
Step 2: Select "School Administrator" role
   ↓
Step 3: Redirect to /setup-school
   ↓
Step 4: Fill school information
   ↓
Step 5: Fill principal profile
   ↓
Step 6: Create Clerk organization
   ↓
Step 7: Webhook creates school in DB
   ↓
Step 8: Update school details
   ↓
Step 9: Create principal user profile
   ↓
Step 10: Redirect to principal dashboard
```

## ❓ Common Questions

### **Q: Where do I enter my name and email?**
**A:** In the **Clerk SignUp component** (Step 1). This happens BEFORE role selection.

### **Q: Where is my password stored?**
**A:** In **Clerk's secure database**, encrypted. NEVER in your Prisma database.

### **Q: Can I change my name/email later?**
**A:** Yes, through your **Clerk account settings**. Changes sync automatically via webhook.

### **Q: What if I select the wrong role?**
**A:** Contact an administrator. Role changes require updating the User record and creating a new profile.

### **Q: Do I need to re-enter my name/email in the profile forms?**
**A:** No! The forms show your Clerk-provided name/email as **read-only** information.

## 🎨 UI Flow Diagram

```
┌─────────────┐
│   /sign-up  │
└──────┬──────┘
       │
       ▼
   Not Authenticated?
       │
       ├─── YES ──→ Show Clerk SignUp Component
       │              │
       │              ▼
       │          Create Account
       │              │
       │              ▼
       │          Authenticated!
       │              │
       └─── NO ───────┘
                      │
                      ▼
              Has Profile in DB?
                      │
                      ├─── YES ──→ Redirect to /dashboard
                      │
                      └─── NO ───→ Show Role Selection
                                      │
                                      ▼
                                  Show Profile Form
                                      │
                                      ▼
                                  Show School Selection
                                      │
                                      ▼
                                  Create User + Profile
                                      │
                                      ▼
                                  Redirect to Dashboard
```

## ✅ Summary

**The sign-up flow is now complete with:**

1. ✅ **Clerk SignUp** - Captures email, password, name
2. ✅ **Role Selection** - User chooses their role
3. ✅ **Profile Forms** - Collects role-specific data
4. ✅ **School Selection** - User joins organization
5. ✅ **Database Creation** - User + Profile created
6. ✅ **Dashboard Redirect** - Role-based access

**Users can now:**
- ✅ Sign up with email/password via Clerk
- ✅ Complete their profile with role-specific info
- ✅ Join their school organization
- ✅ Log in with their credentials
- ✅ Access their role-based dashboard

**The authentication is secure because:**
- ✅ Passwords encrypted by Clerk
- ✅ Email verification handled by Clerk
- ✅ Session management by Clerk
- ✅ No sensitive data in our database
