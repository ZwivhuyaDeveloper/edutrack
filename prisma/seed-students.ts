import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SCHOOL_ID = 'cmgj02p5i0000pf68twm8v7oj'

// Helper function to generate random date within a month
function getRandomDateInMonth(year: number, month: number): Date {
  const day = Math.floor(Math.random() * 28) + 1 // 1-28 to avoid month-end issues
  const hour = Math.floor(Math.random() * 24)
  const minute = Math.floor(Math.random() * 60)
  return new Date(year, month, day, hour, minute)
}

// Helper function to generate random student data
function generateStudentData(index: number, enrollmentDate: Date) {
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
    'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
    'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
    'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
    'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
    'Alexander', 'Rachel', 'Patrick', 'Carolyn', 'Frank', 'Janet', 'Jack', 'Catherine',
    'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Ruth'
  ]

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@student.edu`

  return {
    firstName,
    lastName,
    email,
    clerkId: `student_clerk_${index}_${Date.now()}`,
    role: 'STUDENT' as const,
    schoolId: SCHOOL_ID,
    isActive: true,
    createdAt: enrollmentDate,
    updatedAt: enrollmentDate,
  }
}

async function main() {
  console.log('🌱 Starting student seed...')
  console.log(`📚 School ID: ${SCHOOL_ID}`)

  // Verify school exists
  const school = await prisma.school.findUnique({
    where: { id: SCHOOL_ID }
  })

  if (!school) {
    throw new Error(`School with ID ${SCHOOL_ID} not found!`)
  }

  console.log(`✅ School found: ${school.name}`)

  // Define enrollment distribution over 6 months (Aug 2024 - Jan 2025)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Calculate 6 months back
  const enrollmentDistribution = [
    { month: currentMonth - 5, count: 20, label: 'Month 1', grade: '9' },  // 20 students - Grade 9
    { month: currentMonth - 4, count: 30, label: 'Month 2', grade: '10' }, // 30 students - Grade 10
    { month: currentMonth - 3, count: 35, label: 'Month 3', grade: '11' }, // 35 students - Grade 11
    { month: currentMonth - 2, count: 40, label: 'Month 4', grade: '12' }, // 40 students - Grade 12
    { month: currentMonth - 1, count: 45, label: 'Month 5', grade: '9' },  // 45 students - Grade 9
    { month: currentMonth, count: 30, label: 'Month 6', grade: '10' },     // 30 students - Grade 10
  ] // Total: 200 students

  console.log('\n📊 Enrollment Distribution:')
  
  let studentIndex = 1
  const studentsToCreate = []

  for (const { month, count, label, grade } of enrollmentDistribution) {
    const adjustedMonth = month < 0 ? 12 + month : month
    const year = month < 0 ? currentYear - 1 : currentYear
    
    const monthDate = new Date(year, adjustedMonth, 1)
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    console.log(`  ${label} (${monthName}): ${count} students - Grade ${grade}`)

    for (let i = 0; i < count; i++) {
      const enrollmentDate = getRandomDateInMonth(year, adjustedMonth)
      const studentData = generateStudentData(studentIndex, enrollmentDate)
      studentsToCreate.push({ ...studentData, grade })
      studentIndex++
    }
  }

  console.log(`\n📝 Creating ${studentsToCreate.length} students with profiles...`)

  // Create students individually with their profiles
  let created = 0
  let profilesCreated = 0

  for (const studentData of studentsToCreate) {
    try {
      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          clerkId: studentData.clerkId,
          role: studentData.role,
          schoolId: studentData.schoolId,
          isActive: studentData.isActive,
          createdAt: studentData.createdAt,
          updatedAt: studentData.updatedAt,
        }
      })

      created++

      // Create student profile
      const birthYear = new Date().getFullYear() - (14 + Math.floor(Math.random() * 4)) // Age 14-17
      const birthMonth = Math.floor(Math.random() * 12)
      const birthDay = Math.floor(Math.random() * 28) + 1

      await prisma.studentProfile.create({
        data: {
          studentId: user.id,
          dateOfBirth: new Date(birthYear, birthMonth, birthDay),
          grade: studentData.grade,
          studentIdNumber: `STU${String(created).padStart(5, '0')}`,
          address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, State`,
          emergencyContact: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          createdAt: studentData.createdAt,
          updatedAt: studentData.updatedAt,
        }
      })

      profilesCreated++

      if (created % 20 === 0) {
        console.log(`  ✓ Created ${created}/${studentsToCreate.length} students with profiles`)
      }
    } catch (error) {
      console.error(`  ✗ Failed to create student ${studentData.email}:`, error)
    }
  }

  // Verify total student count
  const totalStudents = await prisma.user.count({
    where: {
      schoolId: SCHOOL_ID,
      role: 'STUDENT'
    }
  })

  const totalProfiles = await prisma.studentProfile.count({
    where: {
      student: {
        schoolId: SCHOOL_ID
      }
    }
  })

  console.log(`\n✅ Seed completed successfully!`)
  console.log(`📊 Total students in school: ${totalStudents}`)
  console.log(`👤 Total student profiles created: ${totalProfiles}`)
  console.log(`\n🎉 Your enrollment chart will now show real growth data!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding students:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
