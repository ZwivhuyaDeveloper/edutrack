# Database Seeding Guide

This guide explains how to populate your EduTrack database with realistic sample data.

## Overview

The seeding process creates comprehensive test data for all database models including:

- **Schools** - Educational institutions with complete profiles
- **Users** - Principals, teachers, students, parents, and clerks with role-specific profiles
- **Academic Structure** - Classes, subjects, terms, and class-subject assignments
- **Scheduling** - Rooms, periods, and timetable (class meetings)
- **Assignments & Grades** - Assignments, submissions, grade categories, and individual grades
- **Attendance** - Sessions and student attendance records
- **Financial Records** - Student accounts, invoices, payments, and fee records
- **Communication** - Events, announcements, and notifications
- **Resources** - Educational materials and lesson plans

## Seeding Scripts

### 1. Basic Seed (`seed.ts`)
Creates the foundational data structure:
- 2 schools (Greenwood High School, Riverside Elementary)
- 1 principal, 5 teachers, 50 students, 30 parents, 1 clerk
- Complete user profiles for all roles
- 5 subjects (Math, English, Biology, History, PE)
- 5 classes (Grade 9A, 9B, 10A, 11A, 12A)
- Class-subject assignments with teacher assignments
- Student enrollments
- 2 academic terms
- 20 rooms with facilities
- 6 periods (including lunch break)
- Parent-child relationships

### 2. Extended Seed (`seed-extended.ts`)
Adds comprehensive operational data:
- **Timetable**: Class meetings scheduled across the week
- **Assignments**: 3-5 assignments per class-subject with realistic due dates
- **Submissions**: 70-90% submission rate with grades and feedback
- **Grade System**: Categories (Assignments 40%, Quizzes 20%, Exams 30%, Participation 10%)
- **Grade Items**: 2-4 items per category with student grades
- **Attendance**: 30 days of attendance data with realistic absence patterns
- **Financial Records**: Student accounts, invoices, payments
- **Events**: 20 school events (meetings, sports, cultural activities)
- **Notifications**: 5-15 notifications per user
- **Announcements**: 10 school-wide announcements

## Running the Seeds

### Prerequisites
Ensure you have:
```bash
# Install dependencies (if not already done)
npm install

# Generate Prisma client
npm run db:generate

# Apply database migrations
npm run db:migrate
```

### Available Commands

```bash
# Run basic seed only
npm run db:seed

# Run extended seed only (requires basic seed to be run first)
npm run db:seed-extended

# Run both seeds in sequence (recommended)
npm run db:seed-all

# Legacy student seed (if needed)
npm run db:seed-students
```

### Recommended Seeding Process

1. **Fresh Start** (recommended for development):
   ```bash
   # Reset database and run full seed
   npm run db:migrate
   npm run db:seed-all
   ```

2. **Add Extended Data** (if basic seed already exists):
   ```bash
   npm run db:seed-extended
   ```

## Sample Data Details

### Users Created
- **Principal**: Sarah Johnson (principal@greenwood.edu)
- **Teachers**: 5 teachers across different departments
- **Students**: 50 students distributed across grade levels
- **Parents**: 30 parents with child relationships
- **Clerk**: Amanda Rodriguez (clerk@greenwood.edu)

### Academic Structure
- **Classes**: Grade 9A, 9B, 10A, 11A, 12A
- **Subjects**: Mathematics, English Literature, Biology, World History, Physical Education
- **Terms**: Fall 2024 (active), Spring 2025 (inactive)

### Financial Data
- Student accounts with varying balances (-$500 to $1000)
- Invoices for tuition, lab fees, library fines
- Payment records with different methods (cash, card, transfer, online)
- Realistic fee structures and payment patterns

### Attendance Patterns
- 85% present, 8% absent, 5% late, 2% excused
- Realistic absence reasons (sick, family emergency, medical appointments)
- 30 days of historical attendance data

### Grade Distribution
- Realistic grade ranges (60-100 points)
- Weighted grade categories
- Teacher feedback on assignments
- Submission patterns reflecting real student behavior

## Database Relationships

The seed data maintains all foreign key relationships:
- Users → School (all users belong to schools)
- Students → Classes (via enrollments)
- Teachers → ClassSubjects (teaching assignments)
- Parents → Students (parent-child relationships)
- Assignments → ClassSubjects → Classes/Subjects
- Grades → Students/Teachers/GradeItems
- Attendance → Students/AttendanceSessions
- Financial records → Students (via student accounts)

## Customization

### Modifying Data Volume
Edit the seed files to adjust:
- Number of students: Change loop count in user creation
- Number of assignments: Modify `assignmentCount` in extended seed
- Date ranges: Update `randomDate` calls for different time periods
- Grade distributions: Adjust `faker.number.float` ranges

### Adding Custom Data
1. Add your custom data creation after existing seeds
2. Ensure foreign key relationships are maintained
3. Use the existing helper functions for consistency

### School-Specific Data
To create data for multiple schools:
1. Modify the school creation section
2. Update user creation to distribute across schools
3. Ensure all related data respects school boundaries

## Troubleshooting

### Common Issues

1. **Foreign Key Constraints**: Ensure basic seed runs before extended seed
2. **Duplicate Data**: Clear existing data or use `db:migrate` to reset
3. **Memory Issues**: Reduce data volume for development environments
4. **Date Conflicts**: Ensure date ranges are logical and non-overlapping

### Verification
After seeding, verify data using:
```bash
# Open Prisma Studio to browse data
npm run db:studio

# Or query specific models
npx prisma db seed --preview-feature
```

## Production Considerations

⚠️ **Warning**: These seeds are for development/testing only. Never run on production databases.

For production:
1. Create minimal seed data only
2. Remove faker dependencies
3. Use real institutional data
4. Implement proper data validation
5. Consider data privacy regulations

## Support

If you encounter issues:
1. Check database connection
2. Verify Prisma schema is up to date
3. Ensure all migrations are applied
4. Review error logs for specific constraint violations

The seeding process creates a fully functional EduTrack environment with realistic data relationships and patterns suitable for development and testing.
