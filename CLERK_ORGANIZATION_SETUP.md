# Clerk Organization-Based Multi-Tenant Setup

## Overview

EduTrack now uses **Clerk Organizations** to implement a multi-tenant architecture where each school is a Clerk organization. This provides:

- ✅ Secure authentication with Clerk
- ✅ Organization-based access control
- ✅ Automatic school-user relationship management
- ✅ Webhook-based synchronization between Clerk and Prisma

## Architecture

```
Clerk Organizations (Schools)
    ↓ (Webhook Sync)
Prisma Database (Schools)
    ↓
Users (Linked to Organizations)
```

## Registration Flow

### **For Principals (Creating New School)**

1. **Clerk Authentication**
   - User creates account via Clerk SignUp component
   - Provides: email, password, first name, last name

2. **Role Selection**
   - User selects "School Administrator" role
   - Redirected to `/setup-school`

3. **School & Profile Setup**
   - Fills school information (name, address, contact)
   - Fills principal profile (employee ID, qualifications, experience)

4. **Organization Creation**
   - API creates Clerk organization with school name
   - Principal automatically added as org admin
   - Webhook creates school record in database
   - API updates school details
   - API creates principal user profile

5. **Dashboard Access**
   - Redirected to principal dashboard
   - Full access to school management

### **For Other Roles (Students, Teachers, Parents, Clerks)**

1. **Clerk Authentication**
   - User creates account via Clerk SignUp component
   - Provides: email, password, first name, last name

2. **Role Selection**
   - User selects their role (Student/Teacher/Parent/Clerk)

3. **Profile Information**
   - Fills role-specific profile data
   - Grade for students, department for teachers, etc.

4. **School Selection**
   - Views list of available schools (Clerk organizations)
   - Selects their school

5. **Organization Membership**
   - API adds user to selected Clerk organization
   - API creates user profile in database
   - User linked to school

6. **Dashboard Access**
   - Redirected to role-based dashboard
   - Access controlled by organization membership

## Webhook Events

### **Organization Events**

#### `organization.created`
```typescript
// Triggered when principal creates school
// Creates school record in database
{
  id: "org_xxx",
  name: "School Name",
  slug: "school-name"
}
```

#### `organization.updated`
```typescript
// Triggered when school details are updated
// Updates school name in database
{
  id: "org_xxx",
  name: "Updated School Name"
}
```

#### `organization.deleted`
```typescript
// Triggered when organization is deleted
// Soft deletes school (sets isActive: false)
{
  id: "org_xxx"
}
```

### **Organization Membership Events**

#### `organizationMembership.created`
```typescript
// Triggered when user joins organization
// Logs membership (user profile created via API)
{
  organization: { id: "org_xxx" },
  public_user_data: { user_id: "user_xxx" }
}
```

### **User Events**

#### `user.created`
```typescript
// Triggered when user signs up
// Logged only - profile created via sign-up flow
{
  id: "user_xxx",
  email_addresses: [{ email_address: "user@example.com" }],
  first_name: "John",
  last_name: "Doe"
}
```

#### `user.updated`
```typescript
// Triggered when user updates profile
// Updates user info in database if exists
{
  id: "user_xxx",
  email_addresses: [{ email_address: "updated@example.com" }],
  first_name: "John",
  last_name: "Doe"
}
```

#### `user.deleted`
```typescript
// Triggered when user is deleted
// Soft deletes user (sets isActive: false)
{
  id: "user_xxx"
}
```

## API Endpoints

### **Organizations**

#### `POST /api/organizations`
Creates a new Clerk organization (school)

**Request:**
```json
{
  "name": "School Name",
  "slug": "school-name"
}
```

**Response:**
```json
{
  "organization": {
    "id": "org_xxx",
    "name": "School Name",
    "slug": "school-name"
  }
}
```

#### `GET /api/organizations`
Lists all Clerk organizations

**Response:**
```json
{
  "organizations": [
    {
      "id": "org_xxx",
      "name": "School Name",
      "slug": "school-name",
      "membersCount": 150
    }
  ]
}
```

### **Schools**

#### `GET /api/schools`
Lists all schools from database

**Query Parameters:**
- `search`: Filter by name, city, or state

**Response:**
```json
{
  "schools": [
    {
      "id": "org_xxx",
      "name": "School Name",
      "city": "City",
      "state": "State",
      "country": "US",
      "_count": { "users": 150 }
    }
  ]
}
```

#### `PATCH /api/schools/[id]`
Updates school details

**Request:**
```json
{
  "address": "123 Main St",
  "city": "City",
  "state": "State",
  "zipCode": "12345",
  "phone": "+1-555-0100",
  "email": "school@example.com",
  "website": "https://school.com"
}
```

### **Users**

#### `POST /api/users`
Creates user profile with role and school

**Request:**
```json
{
  "role": "TEACHER",
  "schoolId": "org_xxx",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "teacherProfile": {
    "employeeId": "EMP001",
    "department": "Mathematics",
    "qualifications": "MSc in Mathematics"
  }
}
```

## Clerk Dashboard Configuration

### **1. Enable Organizations**
- Go to Clerk Dashboard → Organizations
- Enable organizations feature
- Configure organization settings

### **2. Configure Webhooks**
- Go to Clerk Dashboard → Webhooks
- Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
- Select events:
  - `organization.created`
  - `organization.updated`
  - `organization.deleted`
  - `organizationMembership.created`
  - `user.created`
  - `user.updated`
  - `user.deleted`

### **3. Set Environment Variables**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
```

## Database Schema

### **School Model**
```prisma
model School {
  id        String   @id @default(cuid()) // Uses Clerk org ID
  name      String
  address   String?
  city      String
  state     String
  zipCode   String?
  country   String   @default("US")
  phone     String?
  email     String?
  website   String?
  logo      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users User[]
  // ... other relations
}
```

### **User Model**
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique // Clerk user ID
  email     String   @unique
  firstName String
  lastName  String
  role      UserRole
  isActive  Boolean  @default(true)
  
  schoolId String // References Clerk org ID
  school   School @relation(fields: [schoolId], references: [id])
  
  // Role-specific profiles
  studentProfile   StudentProfile?
  teacherProfile   TeacherProfile?
  parentProfile    ParentProfile?
  principalProfile PrincipalProfile?
  clerkProfile     ClerkProfile?
}
```

## Benefits

### **Security**
- ✅ Clerk handles authentication and session management
- ✅ Organization-based access control
- ✅ Automatic token refresh and security

### **Multi-Tenancy**
- ✅ Each school is isolated as an organization
- ✅ Users can only access their organization's data
- ✅ Easy to add/remove users from organizations

### **Scalability**
- ✅ Clerk handles user management at scale
- ✅ Webhook-based sync keeps data consistent
- ✅ No need to manage auth infrastructure

### **User Experience**
- ✅ Single sign-on across the platform
- ✅ Professional authentication UI
- ✅ Social login support (Google, Microsoft, etc.)

## Testing

### **Test Principal Flow**
1. Go to `/sign-up`
2. Create account with Clerk
3. Select "School Administrator"
4. Fill school and principal info
5. Verify organization created in Clerk Dashboard
6. Verify school created in database
7. Verify principal profile created

### **Test Other Roles Flow**
1. Go to `/sign-up`
2. Create account with Clerk
3. Select role (Student/Teacher/Parent/Clerk)
4. Fill profile information
5. Select school from list
6. Verify user added to organization in Clerk
7. Verify user profile created in database

## Troubleshooting

### **Webhook Not Firing**
- Check webhook URL is correct and accessible
- Verify webhook secret matches environment variable
- Check Clerk Dashboard → Webhooks → Attempts for errors

### **Organization Not Created**
- Check API logs for errors
- Verify Clerk API keys are correct
- Ensure organizations feature is enabled in Clerk

### **User Not Added to Organization**
- Check organization membership API call
- Verify user has permission to join organization
- Check Clerk Dashboard → Organizations → Members

## Next Steps

1. ✅ Configure Clerk Dashboard with webhook endpoint
2. ✅ Test principal registration flow
3. ✅ Test other roles registration flow
4. ✅ Verify webhook synchronization
5. ✅ Add organization switcher for multi-school users
6. ✅ Implement role-based permissions within organizations
