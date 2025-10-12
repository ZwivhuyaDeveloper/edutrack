# Student Seed Script

This script populates your database with 200 students for testing the enrollment chart.

## 📊 What It Does

- Creates **200 students** (User records) for school ID: `cmgj02p5i0000pf68twm8v7oj`
- Creates **200 student profiles** (StudentProfile records) with complete data
- Distributes enrollments over **6 months** to show growth trend
- Generates realistic student data (names, emails, grades, DOB, addresses)
- Sets proper enrollment dates (`createdAt`) for accurate chart representation

## 📈 Enrollment Distribution

| Month | Students | Grade | Cumulative |
|-------|----------|-------|------------|
| Month 1 | 20 | 9 | 20 |
| Month 2 | 30 | 10 | 50 |
| Month 3 | 35 | 11 | 85 |
| Month 4 | 40 | 12 | 125 |
| Month 5 | 45 | 9 | 170 |
| Month 6 | 30 | 10 | 200 |

**Total: 200 students across grades 9-12**

## 👤 Student Profile Data

Each student profile includes:
- **Date of Birth**: Random age 14-17 years old
- **Grade**: Distributed across grades 9, 10, 11, 12
- **Student ID Number**: Sequential (STU00001, STU00002, etc.)
- **Address**: Randomly generated street addresses
- **Emergency Contact**: Random phone numbers
- **Created/Updated timestamps**: Match user enrollment date

## 🚀 How to Run

### Prerequisites
1. Make sure your `.env` file has the correct `DATABASE_URL`
2. Ensure the school with ID `cmgj02p5i0000pf68twm8v7oj` exists in your database

### Run the Seed

```bash
npm run db:seed-students
```

Or directly with tsx:

```bash
npx tsx prisma/seed-students.ts
```

## ✅ Expected Output

```
🌱 Starting student seed...
📚 School ID: cmgj02p5i0000pf68twm8v7oj
✅ School found: [School Name]

📊 Enrollment Distribution:
  Month 1 (Aug 2024): 20 students
  Month 2 (Sep 2024): 30 students
  Month 3 (Oct 2024): 35 students
  Month 4 (Nov 2024): 40 students
  Month 5 (Dec 2024): 45 students
  Month 6 (Jan 2025): 30 students

📝 Creating 200 students...
  ✓ Created 50/200 students
  ✓ Created 100/200 students
  ✓ Created 150/200 students
  ✓ Created 200/200 students

✅ Seed completed successfully!
📊 Total students in school: 200

🎉 Your enrollment chart will now show real growth data!
```

## 📊 Chart Impact

After running this seed, your enrollment chart will show:
- **Real enrollment trend** over 6 months
- **Growth pattern** from 20 → 200 students
- **Accurate dates** based on `createdAt` timestamps
- **Visible line** with proper data points

## 🔧 Customization

To modify the seed for a different school:

1. Open `prisma/seed-students.ts`
2. Change the `SCHOOL_ID` constant:
   ```typescript
   const SCHOOL_ID = 'your-school-id-here'
   ```
3. Optionally adjust the enrollment distribution in the `enrollmentDistribution` array

## 🗑️ Cleanup

To remove seeded students:

```sql
DELETE FROM users 
WHERE "schoolId" = 'cmgj02p5i0000pf68twm8v7oj' 
AND role = 'STUDENT' 
AND email LIKE '%@student.edu';
```

Or use Prisma Studio:
```bash
npm run db:studio
```

## 📝 Notes

- Students are created with unique emails: `firstname.lastname{index}@student.edu`
- All students have `isActive: true`
- Clerk IDs are generated as: `student_clerk_{index}_{timestamp}`
- Enrollment dates are randomly distributed within each month
- The script uses batch creation (50 students per batch) for performance

## 🐛 Troubleshooting

**Error: School not found**
- Verify the school ID exists in your database
- Check your `DATABASE_URL` is correct

**Error: Unique constraint violation**
- Students with the same email already exist
- Run the cleanup SQL or change the email generation logic

**Error: Can't reach database**
- Check your `DATABASE_URL` in `.env`
- Ensure your database server is running
