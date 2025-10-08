# EduTrack Authentication & Database Testing Guide

## ✅ Database Reset Complete

The Prisma database has been successfully reset. All tables are now empty and ready for testing.

**Current State:**
- 🔄 Schools: 0
- 👥 Users: 0
- 👔 Principals: 0
- 👨‍🏫 Teachers: 0
- 👨‍🎓 Students: 0
- 👪 Parents: 0

---

## 🧪 Testing Flow

### **Test 1: Principal Registration & School Creation**

#### Step 1: Sign Up as Principal
1. Navigate to `/sign-up`
2. Complete Clerk authentication (email verification)
3. You'll be redirected back to `/sign-up` (authenticated)
4. Select **"PRINCIPAL"** role
5. Fill out principal profile information
6. Click "Continue to School Setup"

#### Step 2: Create School
1. You'll be redirected to `/setup-school`
2. Fill in school information:
   - School name (required)
   - Address, city, state, zip code
   - Country (default: US)
   - Phone, email, website (optional)
3. Fill in principal profile details:
   - Employee ID
   - Hire date
   - Phone, address, emergency contact
   - Qualifications, years of experience
   - Previous school, education background
   - Salary, administrative area
4. Click "Create School & Profile"

#### Expected Results:
- ✅ School created in database with Clerk Organization ID
- ✅ Principal user created and linked to school
- ✅ Principal profile created
- ✅ Clerk organization created
- ✅ Principal added to Clerk organization as admin
- ✅ Success page displayed with 10-second countdown
- ✅ Automatic redirect to dashboard

---

### **Test 2: Teacher/Student/Parent Registration**

#### Step 1: Sign Up with Role
1. Navigate to `/sign-up` (use different email)
2. Complete Clerk authentication
3. Select role: **TEACHER**, **STUDENT**, or **PARENT**
4. Fill out role-specific profile information

#### Step 2: Select School
1. Search for the school created in Test 1
2. Select the school from the list
3. Click "Complete Registration"

#### Expected Results:
- ✅ User created in database
- ✅ Role-specific profile created
- ✅ User added to school's Clerk organization
- ✅ User metadata updated with permissions
- ✅ Success message displayed
- ✅ Redirect to dashboard

---

### **Test 3: Profile & Dashboard Access**

#### After Registration:
1. Navigate to `/profile`
   - ✅ Should display user information
   - ✅ Should show school details
   - ✅ Should display role-specific profile data

2. Navigate to `/dashboard`
   - ✅ Should display role-appropriate dashboard
   - ✅ Should show school information
   - ✅ Should have proper navigation

---

## 🔍 Verification Checklist

### Database Verification
Run diagnostic scripts to verify data:

```bash
# Check schools and users
node scripts/simple-check.js

# Check for Clerk organization IDs
node scripts/fix-school-organizations.js

# Check principals
node scripts/reset-user-principal.js
```

### Clerk Verification
Check Clerk Dashboard:
- ✅ Organizations created for schools
- ✅ Users added to organizations
- ✅ User metadata populated with roles and permissions
- ✅ Organization roles assigned correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: "School not properly configured for new registrations"
**Cause:** School doesn't have Clerk Organization ID  
**Solution:** Only use schools created through `/setup-school` page

### Issue 2: "You are already the principal of [School Name]"
**Cause:** User already has principal role  
**Solution:** Use different Clerk account or reset user in database

### Issue 3: "Email already exists"
**Cause:** Email is registered to another user  
**Solution:** Use different email address for testing

### Issue 4: Redirect loops
**Cause:** Environment variables not set correctly  
**Solution:** Check `ENVIRONMENT_SETUP.md` for correct configuration

---

## 📊 Expected Database State After Testing

After completing all tests, you should have:

```
Schools: 1 (with Clerk Organization ID)
Users: 4+ (1 principal, 1 teacher, 1 student, 1 parent minimum)
Principals: 1
Teachers: 1+
Students: 1+
Parents: 1+
```

---

## 🔄 Reset Database Again

If you need to reset and start over:

```bash
# Force reset database
npx prisma db push --force-reset

# Verify reset
node scripts/simple-check.js
```

---

## 📝 Test Scenarios

### Scenario 1: Complete School Setup
- [ ] Principal signs up
- [ ] School created successfully
- [ ] Clerk organization created
- [ ] Principal can access dashboard
- [ ] Principal can view profile

### Scenario 2: Multi-User Registration
- [ ] Teacher joins school
- [ ] Student joins school
- [ ] Parent joins school
- [ ] All users can access dashboard
- [ ] All users have proper permissions

### Scenario 3: Error Handling
- [ ] Duplicate principal attempt blocked
- [ ] Invalid school selection handled
- [ ] Missing required fields validated
- [ ] Network errors handled gracefully

---

## 🎯 Success Criteria

✅ **Authentication Flow**
- Users can sign up with Clerk
- Two-stage authentication works (Clerk + Prisma)
- Redirects work correctly without loops

✅ **School Creation**
- Principals can create schools
- Clerk organizations created automatically
- School data persisted correctly

✅ **User Registration**
- All roles can register
- Users added to Clerk organizations
- Role-specific profiles created

✅ **Navigation**
- Dashboard accessible after registration
- Profile page displays correct information
- No back button issues

✅ **Error Handling**
- Clear error messages displayed
- Invalid operations blocked
- User guidance provided

---

## 🚀 Ready to Test!

Your database is clean and ready. Start with **Test 1** to create your first principal and school!

**Important Environment Variables:**
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/sign-up`
- `CLERK_WEBHOOK_SECRET` configured
- Database connection working

Good luck with testing! 🎉
