# ✅ Principal Flow Fixed

## 🐛 **Problem**

When selecting PRINCIPAL role, the flow was bypassing the principal details form and going directly to school setup.

**Incorrect Flow:**
```
1. Select PRINCIPAL role
2. ❌ Skip profile form
3. Go directly to school setup
4. Missing principal details!
```

---

## ✅ **Solution**

Fixed the `handleRoleSelect` function to ensure PRINCIPAL goes through the profile form first.

### **Code Change:**

**Before (Broken):**
```typescript
const handleRoleSelect = (role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'CLERK') => {
  console.log('Role selected:', role)
  setSelectedRole(role)
  
  if (role === 'PRINCIPAL') {
    setStep('school-setup')  // ❌ Skips profile form!
  } else {
    setStep('school')
  }
}
```

**After (Fixed):**
```typescript
const handleRoleSelect = (role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'CLERK') => {
  console.log('Role selected:', role)
  setSelectedRole(role)
  
  // All roles go to profile form first to collect their details
  // PRINCIPAL will then go to school-setup after profile
  // Other roles will go to school selection after profile
  setStep('profile')  // ✅ Everyone goes to profile first!
}
```

---

## 🎯 **Correct Principal Flow**

### **Step-by-Step:**

```
1. User signs up with Clerk
   → Email/password or OAuth
   
2. User selects PRINCIPAL role
   → Click "Principal/Admin" card
   
3. ✅ Profile form appears
   → Collects principal details:
     - Employee ID
     - Hire Date
     - Phone
     - Address
     - Emergency Contact
     - Qualifications
     - Years of Experience
     - Previous School
     - Education Background
     - Salary
     - Administrative Area
   
4. User fills principal details
   → Click "Continue to School Setup"
   
5. Profile data saved to sessionStorage
   → Stores: { role, firstName, lastName, email, principalProfile }
   
6. Redirect to /setup-school
   → Create school with principal profile
   
7. School created
   → Principal becomes owner
   → Profile saved to database
   
8. Redirect to dashboard
   → Principal dashboard with full access
```

---

## 📋 **Profile Form Fields**

### **Principal Information Form:**

```typescript
{selectedRole === 'PRINCIPAL' && (
  <div className="space-y-4">
    {/* Employee ID */}
    <Input
      value={profileData.principal.employeeId}
      onChange={(e) => setProfileData(prev => ({
        ...prev,
        principal: { ...prev.principal, employeeId: e.target.value }
      }))}
      placeholder="Employee ID"
    />
    
    {/* Hire Date */}
    <Input
      type="date"
      value={profileData.principal.hireDate}
      onChange={(e) => setProfileData(prev => ({
        ...prev,
        principal: { ...prev.principal, hireDate: e.target.value }
      }))}
    />
    
    {/* Phone */}
    <Input
      type="tel"
      value={profileData.principal.phone}
      placeholder="Phone number"
    />
    
    {/* Address */}
    <Input
      value={profileData.principal.address}
      placeholder="Address"
    />
    
    {/* Emergency Contact */}
    <Input
      value={profileData.principal.emergencyContact}
      placeholder="Emergency contact"
    />
    
    {/* Qualifications */}
    <Input
      value={profileData.principal.qualifications}
      placeholder="Qualifications (e.g., M.Ed, PhD)"
    />
    
    {/* Years of Experience */}
    <Input
      type="number"
      value={profileData.principal.yearsOfExperience}
      placeholder="Years of experience"
    />
    
    {/* Previous School */}
    <Input
      value={profileData.principal.previousSchool}
      placeholder="Previous school"
    />
    
    {/* Education Background */}
    <Input
      value={profileData.principal.educationBackground}
      placeholder="Education background"
    />
    
    {/* Salary */}
    <Input
      type="number"
      value={profileData.principal.salary}
      placeholder="Salary"
    />
    
    {/* Administrative Area */}
    <Input
      value={profileData.principal.administrativeArea}
      placeholder="Administrative area"
    />
  </div>
)}
```

---

## 🔄 **Flow Comparison**

### **Before (Broken):**
```
Role Selection → School Setup (Missing principal details!)
```

### **After (Fixed):**
```
Role Selection → Profile Form → School Setup (With principal details!)
```

---

## ✅ **What Gets Saved**

### **In sessionStorage:**
```json
{
  "role": "PRINCIPAL",
  "schoolId": "temp",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "principalProfile": {
    "employeeId": "EMP001",
    "hireDate": "2024-01-01",
    "phone": "+1234567890",
    "address": "123 Main St",
    "emergencyContact": "Jane Doe +0987654321",
    "qualifications": "M.Ed, Educational Leadership",
    "yearsOfExperience": 15,
    "previousSchool": "Lincoln High School",
    "educationBackground": "Masters in Education",
    "salary": 85000,
    "administrativeArea": "Academic Affairs"
  }
}
```

### **In Database (after school creation):**
```sql
-- User table
INSERT INTO users (clerkId, email, firstName, lastName, role, schoolId)

-- PrincipalProfile table
INSERT INTO principal_profiles (
  principalId, employeeId, hireDate, phone, address,
  emergencyContact, qualifications, yearsOfExperience,
  previousSchool, educationBackground, salary, administrativeArea
)
```

---

## 🧪 **Testing**

### **Test 1: Complete Principal Flow**
1. Sign up with new account
2. Select PRINCIPAL role
3. **Expected:** Profile form appears ✅
4. Fill in principal details
5. Click "Continue to School Setup"
6. **Expected:** Redirects to /setup-school ✅
7. Create school
8. **Expected:** Principal profile saved ✅

### **Test 2: Verify Profile Data**
1. Complete principal sign-up
2. Go to /dashboard/profile
3. **Expected:** All principal details visible ✅

### **Test 3: Other Roles Still Work**
1. Select STUDENT role
2. **Expected:** Profile form appears ✅
3. Fill student details
4. **Expected:** Goes to school selection ✅

---

## 📊 **All Role Flows**

| Role | Profile Form | Next Step | Creates School |
|------|--------------|-----------|----------------|
| STUDENT | ✅ Student details | School selection | ❌ |
| TEACHER | ✅ Teacher details | School selection | ❌ |
| PARENT | ✅ Parent details | School selection | ❌ |
| PRINCIPAL | ✅ **Principal details** | **School setup** | ✅ |
| CLERK | ✅ Clerk details | School selection | ❌ |

---

## ✅ **Verification Checklist**

- [x] PRINCIPAL goes to profile form first
- [x] Profile form shows principal fields
- [x] Principal details are collected
- [x] Data saved to sessionStorage
- [x] Redirects to /setup-school
- [x] School creation includes principal profile
- [x] Principal profile saved to database
- [x] Other roles still work correctly

---

## 🎯 **Summary**

**Problem:** Principal flow bypassed profile form  
**Solution:** Changed `handleRoleSelect` to always go to profile first  
**Result:** Principal details are now properly collected before school setup

**Changes Made:**
- ✅ Updated `handleRoleSelect` function
- ✅ All roles now go through profile form
- ✅ PRINCIPAL flow: Role → Profile → School Setup
- ✅ Other roles flow: Role → Profile → School Selection

---

**Status:** ✅ **Fixed**  
**File:** `src/app/sign-up/[[...sign-up]]/page.tsx`  
**Lines Changed:** 4  
**Impact:** Principal flow now works correctly
