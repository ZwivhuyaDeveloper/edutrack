# Parent-Learner Relationship Feature Guide

## ✅ Feature Overview

The parent-learner relationship feature allows **parents** and **students** to connect with each other during the sign-up process, automatically creating relationships in the database.

---

## 🔄 Authentication Flow with Relationships

### **For Students:**
1. Sign up with Clerk
2. Select **STUDENT** role
3. Fill out student profile (grade, date of birth, etc.)
4. Select school
5. **[NEW]** Search for parent/guardian (optional)
6. Select relationship type (Parent, Guardian, Grandparent, Sibling)
7. Complete registration → Relationship created in database

### **For Parents:**
1. Sign up with Clerk
2. Select **PARENT** role
3. Fill out parent profile (phone, address, etc.)
4. Select school
5. **[NEW]** Search for child/student (optional)
6. Select relationship type (Parent, Guardian, Grandparent, Sibling)
7. Complete registration → Relationship created in database

---

## 🎯 Key Features

### **1. User Search Functionality**
- **Search by name or email** within the same school
- **Real-time search** with debouncing (300ms delay)
- **Minimum 2 characters** required for search
- **Maximum 10 results** displayed
- **Role-based filtering**: Parents search for students, students search for parents

### **2. Relationship Types**
- **PARENT** - Biological or adoptive parent
- **GUARDIAN** - Legal guardian
- **GRANDPARENT** - Grandparent
- **SIBLING** - Brother or sister

### **3. Optional Relationship**
- Users can **skip** the relationship step
- Relationships can be added later through the dashboard
- Registration completes successfully without relationships

### **4. Automatic Database Updates**
- **ParentChildRelationship** record created automatically
- **Proper parent-child mapping** based on roles
- **Validation** ensures only valid relationships (Parent ↔ Student)
- **Error handling** doesn't fail registration if relationship creation fails

---

## 📋 Database Schema

### **ParentChildRelationship Model**
```prisma
model ParentChildRelationship {
  id           String           @id @default(cuid())
  parentId     String
  childId      String
  relationship RelationshipType @default(PARENT)

  parent User @relation("ParentChild", fields: [parentId], references: [id])
  child  User @relation("ChildParent", fields: [childId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([parentId, childId])
}
```

### **Relationship Types**
```prisma
enum RelationshipType {
  PARENT
  GUARDIAN
  GRANDPARENT
  SIBLING
}
```

---

## 🔧 API Endpoints

### **1. User Search API**
**Endpoint:** `GET /api/users/search`

**Query Parameters:**
- `school` (required) - School ID to search within
- `role` (required) - Role to search for (STUDENT or PARENT)
- `search` (required) - Search term (name or email)

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT"
    }
  ]
}
```

### **2. User Creation with Relationship**
**Endpoint:** `POST /api/users`

**Request Body (additional fields):**
```json
{
  "role": "PARENT",
  "schoolId": "school_id",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "relationshipUserId": "student_user_id",
  "relationshipType": "PARENT",
  "parentProfile": {
    "phone": "123-456-7890",
    "address": "123 Main St",
    "emergencyContact": "Emergency contact info"
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "new_user_id",
    "email": "jane@example.com",
    "role": "PARENT",
    "schoolId": "school_id"
  }
}
```

---

## 🎨 UI Components

### **Relationship Step UI**
- **Search input** with search icon
- **Relationship type selector** (dropdown)
- **Search results list** (scrollable, max 10 items)
- **Selected user confirmation** (green highlight)
- **Action buttons:**
  - "Skip & Complete Registration" (outline button)
  - "Complete Registration" (primary button, disabled without selection)

### **User Search Result Card**
```
┌─────────────────────────────────────┐
│ John Doe                      👥    │
│ john@example.com          STUDENT   │
└─────────────────────────────────────┘
```

### **Selected User Confirmation**
```
┌─────────────────────────────────────┐
│ ✓ Selected: John Doe                │
│   PARENT relationship will be created│
└─────────────────────────────────────┘
```

---

## 🔍 Validation & Error Handling

### **Validation Rules:**
1. **Same school requirement**: Both users must be in the same school
2. **Role compatibility**: Only PARENT ↔ STUDENT relationships allowed
3. **Active users only**: Only active users appear in search results
4. **Unique relationships**: Duplicate relationships prevented by database constraint

### **Error Handling:**
- **User not found**: Warning logged, registration continues
- **Invalid relationship**: Warning logged, registration continues
- **Database error**: Error logged, registration continues
- **Search failure**: Empty results returned, user can skip

---

## 🧪 Testing Scenarios

### **Scenario 1: Parent Finds Existing Student**
1. Student "John Doe" registers first
2. Parent "Jane Doe" registers
3. Parent searches for "John"
4. Parent selects John from results
5. Parent chooses "PARENT" relationship
6. Parent completes registration
7. **Expected**: ParentChildRelationship created with Jane as parent, John as child

### **Scenario 2: Student Finds Existing Parent**
1. Parent "Jane Doe" registers first
2. Student "John Doe" registers
3. Student searches for "Jane"
4. Student selects Jane from results
5. Student chooses "PARENT" relationship
6. Student completes registration
7. **Expected**: ParentChildRelationship created with Jane as parent, John as child

### **Scenario 3: Skip Relationship**
1. User registers (parent or student)
2. User clicks "Skip & Complete Registration"
3. **Expected**: User created without relationship, registration successful

### **Scenario 4: No Search Results**
1. User searches for non-existent name
2. No results displayed
3. User can skip or search again
4. **Expected**: Smooth UX, no errors

---

## 📊 Database Queries

### **Find Parent-Child Relationships**
```typescript
const relationships = await prisma.parentChildRelationship.findMany({
  where: {
    OR: [
      { parentId: userId },
      { childId: userId }
    ]
  },
  include: {
    parent: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    },
    child: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    }
  }
})
```

### **Find All Children of a Parent**
```typescript
const children = await prisma.user.findMany({
  where: {
    childRelationships: {
      some: {
        parentId: parentUserId
      }
    }
  }
})
```

### **Find All Parents of a Student**
```typescript
const parents = await prisma.user.findMany({
  where: {
    parentRelationships: {
      some: {
        childId: studentUserId
      }
    }
  }
})
```

---

## 🚀 Future Enhancements

### **Potential Features:**
1. **Multiple relationships**: Allow students to have multiple parents/guardians
2. **Relationship management**: Edit/delete relationships from dashboard
3. **Relationship requests**: Send requests instead of immediate creation
4. **Sibling relationships**: Enhanced support for sibling connections
5. **Notifications**: Notify users when relationships are created
6. **Relationship history**: Track changes to relationships over time

---

## 🔐 Security Considerations

### **Access Control:**
- ✅ Users can only search within their own school
- ✅ Authentication required for all endpoints
- ✅ Role-based validation enforced
- ✅ Clerk organization membership verified

### **Data Privacy:**
- ✅ Limited user information in search results
- ✅ Email addresses visible only to authenticated users
- ✅ Relationships only visible to involved parties

---

## 📝 Summary

The parent-learner relationship feature provides a seamless way for families to connect during registration:

✅ **Easy to use**: Simple search and select interface
✅ **Optional**: Users can skip if needed
✅ **Flexible**: Multiple relationship types supported
✅ **Secure**: School-based isolation and role validation
✅ **Reliable**: Error handling ensures registration success
✅ **Scalable**: Database schema supports complex family structures

**Ready for testing!** 🎉
