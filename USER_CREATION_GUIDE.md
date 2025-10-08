# User Creation Guide

## Frontend Implementation Guide

### How to Use the User Creation Helper

```tsx
import { createUser, handlePostCreationRedirect, validateUserData } from '@/lib/user-creation'

// Example: Creating a Teacher
async function handleCreateTeacher(formData: any) {
  // 1. Validate data first
  const validation = validateUserData(formData)
  if (!validation.isValid) {
    validation.errors.forEach(error => toast.error(error))
    return
  }

  // 2. Create the user
  const result = await createUser({
    role: 'TEACHER',
    schoolId: 'school-id-here',
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    department: formData.department,
    teacherProfile: {
      employeeId: formData.employeeId,
      hireDate: formData.hireDate,
      qualifications: formData.qualifications,
    }
  })

  // 3. Handle the result
  if (result.success) {
    // Success - redirect using the established pattern
    handlePostCreationRedirect('teacher', false) // or true if in modal
  } else {
    // Error handling is already done by createUser function
    console.log('Creation failed:', result.error)
  }
}
```

## Error Types and Handling

### 1. Duplicate Email Error (409)
```json
{
  "error": "A user with this email address already exists...",
  "field": "email",
  "code": "DUPLICATE_EMAIL"
}
```
**Frontend Action**: Show specific error message, highlight email field

### 2. School Configuration Error (400)
```json
{
  "error": "School \"School Name\" is not properly configured..."
}
```
**Frontend Action**: Show error, suggest contacting administrator

### 3. Network Error
**Frontend Action**: Show retry option, check connection

## Redirect Pattern (From Memories)

✅ **Correct**: Use `window.location.replace()` to prevent back button issues
```tsx
window.location.replace('/dashboard/principal/people?tab=teachers&created=true')
```

❌ **Avoid**: `router.push()` which can cause redirect loops
```tsx
router.push('/dashboard') // Don't use this
```

## Current Status

### ✅ Backend Fixed
- Enhanced error handling with proper status codes
- Structured error responses with field/code information  
- Proper validation for school Clerk organization setup
- Database connection retry logic implemented

### ✅ Frontend Helper Ready
- `createUser()` function with comprehensive error handling
- `validateUserData()` for client-side validation
- `handlePostCreationRedirect()` following established patterns
- Toast notifications for all error cases

### 🔧 Next Steps
1. Update your user creation forms to use the `createUser()` helper
2. Replace any existing error handling with the new structured approach
3. Ensure redirects use `window.location.replace()` pattern
4. Test with both valid and invalid email addresses

## Example Form Integration

```tsx
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  employeeId: '',
  hireDate: '',
  qualifications: ''
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const result = await createUser({
    role: 'TEACHER',
    schoolId: currentUser.schoolId,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    department: formData.department,
    teacherProfile: {
      employeeId: formData.employeeId,
      hireDate: formData.hireDate,
      qualifications: formData.qualifications,
    }
  })
  
  if (result.success) {
    handlePostCreationRedirect('teacher')
  }
  // Error handling is automatic via toast notifications
}
```
