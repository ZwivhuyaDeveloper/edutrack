# EduTrack Database Seed Documentation

## Overview

The EduTrack seed file (`prisma/seed.ts`) is a **contextual seeding system** that analyzes your existing database and creates realistic mock data that fits your current school context.

## Key Features

### 🔍 **Context-Aware Seeding**
- Fetches existing school, users, classes, subjects, and terms
- Only creates data that doesn't already exist
- Adapts to your current database state

### 🎯 **Smart Data Generation**
- Creates realistic names using predefined lists
- Generates appropriate email addresses based on roles
- Creates logical relationships between entities
- Uses realistic dates and scheduling

### 📊 **Comprehensive Data Coverage**
- **Users**: Teachers, students, parents (with profiles)
- **Academic Structure**: Subjects, classes, terms, enrollments
- **Teaching Data**: Assignments, lesson plans, grades, attendance
- **Communication**: Messages, conversations, announcements
- **Resources**: Educational materials with tags and links
- **Events**: School events with proper audiences
- **Financial**: Student accounts, invoices, payments

## How It Works

### 1. **Database Analysis**
```typescript
const context = await fetchDatabaseContext()
```
- Finds the first school in your database
- Analyzes existing users, classes, subjects, and terms
- Categorizes users by role (teachers, students, parents)

### 2. **Contextual Data Creation**
The seed creates data based on what exists:

- **Missing Subjects**: Adds core subjects if they don't exist
- **Active Term**: Creates current academic term if none exists
- **Teacher Coverage**: Ensures adequate teachers for subjects
- **Student Population**: Creates realistic student numbers per class
- **Realistic Relationships**: Links students to appropriate classes by grade

### 3. **Data Relationships**
- Students enrolled in grade-appropriate classes
- Teachers assigned to subjects matching their departments
- Assignments created for active class-subject combinations
- Attendance records with realistic patterns (85% present, 8% absent, etc.)
- Parent-child relationships where applicable

## Usage

### Prerequisites
- A school must exist in your database
- At least one user should exist (the system will build around existing data)

### Running the Seed

#### Option 1: Direct Command
```bash
npx tsx prisma/seed.ts
```

#### Option 2: Using the Script
```bash
node scripts/run-seed.js
```

#### Option 3: Package.json Script
Add to your `package.json`:
```json
{
  "scripts": {
    "seed": "tsx prisma/seed.ts"
  }
}
```
Then run: `npm run seed`

## Generated Data Structure

### Core Academic Data
- **10 Core Subjects**: Math, English, Science, Social Studies, PE, Art, Music, CS, Foreign Language, Health
- **Class-Subject Assignments**: 4-6 subjects per class
- **Student Enrollments**: Students enrolled in grade-appropriate classes
- **Active Academic Term**: Current semester/year term

### Teaching & Learning
- **Assignments**: 2-4 assignments per class-subject combination
- **Lesson Plans**: 3-5 lessons per class-subject (mix of published/draft)
- **Attendance Sessions**: 5-9 sessions per class with realistic attendance patterns
- **Grades**: Sample grade categories, items, and student grades

### Communication & Events
- **School Announcements**: 6 sample announcements with varied priorities
- **School Events**: 8 events including conferences, fairs, sports, cultural events
- **Educational Resources**: 2-4 resources per subject with tags and links

### Realistic Data Patterns
- **Names**: Uses realistic first/last name combinations
- **Emails**: Role-appropriate email formats (`student.name@school.edu`)
- **Dates**: Contextual dates (past for attendance, future for assignments)
- **Attendance**: Weighted realistic patterns (85% present, 8% absent, 5% late, 2% excused)

## Customization

### Adding More Subjects
Edit the `subjects` array in the seed file:
```typescript
const subjects = [
  { name: 'Your Subject', code: 'CODE', description: 'Subject description' },
  // ... existing subjects
]
```

### Adjusting Student/Teacher Ratios
Modify these calculations:
```typescript
const targetTeacherCount = Math.max(6, Math.ceil(context.subjects.length * 0.8))
const targetStudentCount = Math.max(20, context.classes.length * 25)
```

### Customizing Names
Update the `firstNames` and `lastNames` arrays with names appropriate for your region/culture.

## Error Handling

The seed includes comprehensive error handling:
- **Missing School**: Throws error if no school exists
- **API Fallbacks**: Uses mock data if API endpoints aren't available
- **Duplicate Prevention**: Checks for existing data before creation
- **Transaction Safety**: Uses Prisma transactions where appropriate

## Integration with Memories

The seed is designed to work with the authentication system described in the project memories:
- Compatible with Clerk authentication flow
- Supports the two-stage user creation process
- Works with existing user profiles and school setup

## Troubleshooting

### Common Issues

1. **"No school found"**: Ensure at least one school exists in your database
2. **Permission errors**: Make sure your database connection has write permissions
3. **Unique constraint violations**: The seed checks for existing data, but manual database changes might cause conflicts

### Debugging
Enable detailed logging by adding console.log statements in the seed functions.

## Future Enhancements

Potential improvements:
- **Configuration file**: External config for data generation parameters
- **Localization**: Support for different languages and cultures
- **Advanced relationships**: More complex parent-child, teacher-student relationships
- **Historical data**: Generate data spanning multiple academic years
- **Performance optimization**: Batch operations for large datasets

## Security Notes

- All generated data uses placeholder/example domains
- No real personal information is included
- Clerk IDs are temporary and should be updated when real users register
- All passwords and sensitive data should be handled by your authentication system

---

**Note**: This seed is designed for development and testing purposes. Always review generated data before using in production environments.
