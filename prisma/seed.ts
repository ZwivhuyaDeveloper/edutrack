import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper functions for seeding

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (in correct order due to foreign key constraints)
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.messageAttachment.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversationParticipant.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.lessonPlanAttachment.deleteMany()
  await prisma.lessonPlan.deleteMany()
  await prisma.resourceTagJoin.deleteMany()
  await prisma.resourceLink.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.resourceTag.deleteMany()
  await prisma.eventAttendee.deleteMany()
  await prisma.eventAudience.deleteMany()
  await prisma.event.deleteMany()
  await prisma.classMeeting.deleteMany()
  await prisma.period.deleteMany()
  await prisma.room.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.attendanceSession.deleteMany()
  await prisma.grade.deleteMany()
  await prisma.gradeItem.deleteMany()
  await prisma.gradeCategory.deleteMany()
  await prisma.assignmentSubmission.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.term.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.classSubject.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.class.deleteMany()
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.studentAccount.deleteMany()
  await prisma.fee_records.deleteMany()
  await prisma.teaching_assignments.deleteMany()
  await prisma.parentChildRelationship.deleteMany()
  await prisma.clerkProfile.deleteMany()
  await prisma.principalProfile.deleteMany()
  await prisma.parentProfile.deleteMany()
  await prisma.teacherProfile.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.school.deleteMany()

  console.log('🗑️  Cleared existing data')

  // 1. Create Schools
  const schools = await Promise.all([
    prisma.school.create({
      data: {
        name: 'Greenwood High School',
        address: '123 Education Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'US',
        phone: '+1-555-0101',
        email: 'info@greenwood.edu',
        website: 'https://greenwood.edu',
        clerkOrganizationId: 'org_greenwood_123',
        isActive: true,
      },
    }),
    prisma.school.create({
      data: {
        name: 'Riverside Elementary',
        address: '456 River Road',
        city: 'Riverside',
        state: 'CA',
        zipCode: '92501',
        country: 'US',
        phone: '+1-555-0102',
        email: 'contact@riverside.edu',
        website: 'https://riverside.edu',
        clerkOrganizationId: 'org_riverside_456',
        isActive: true,
      },
    }),
  ])

  console.log('🏫 Created schools')

  // 2. Create Users with Profiles
  const users = []
  
  // Create Principal
  const principal = await prisma.user.create({
    data: {
      clerkId: 'user_principal_001',
      email: 'principal@greenwood.edu',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'PRINCIPAL',
      avatar: faker.image.avatar(),
      schoolId: schools[0].id,
      principalProfile: {
        create: {
          employeeId: 'EMP001',
          hireDate: new Date('2020-08-15'),
          phone: '+1-555-0201',
          address: '789 Principal Ave, Springfield, IL 62701',
          emergencyContact: 'Michael Johnson - +1-555-0202',
          qualifications: 'M.Ed Educational Leadership, B.A. Mathematics',
          yearsOfExperience: 15,
          previousSchool: 'Lincoln Middle School',
          educationBackground: 'Masters in Educational Leadership from State University',
          salary: 95000,
          administrativeArea: 'School Operations',
        },
      },
      clerkProfile: {
        create: {
          employeeId: 'EMP001',
          department: 'Administration',
          hireDate: new Date('2020-08-15'),
          phone: '+1-555-0201',
          address: '789 Principal Ave, Springfield, IL 62701',
        },
      },
    },
  })
  users.push(principal)

  // Create Teachers
  const teacherData = [
    { name: 'John Smith', subject: 'Mathematics', dept: 'Math Department' },
    { name: 'Emily Davis', subject: 'English', dept: 'English Department' },
    { name: 'Michael Brown', subject: 'Science', dept: 'Science Department' },
    { name: 'Lisa Wilson', subject: 'History', dept: 'Social Studies' },
    { name: 'David Garcia', subject: 'Physical Education', dept: 'PE Department' },
  ]

  for (let i = 0; i < teacherData.length; i++) {
    const teacher = teacherData[i]
    const [firstName, lastName] = teacher.name.split(' ')
    
    const user = await prisma.user.create({
      data: {
        clerkId: `user_teacher_${String(i + 1).padStart(3, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@greenwood.edu`,
        firstName,
        lastName,
        role: 'TEACHER',
        avatar: faker.image.avatar(),
        schoolId: schools[0].id,
        teacherProfile: {
          create: {
            employeeId: `TCH${String(i + 1).padStart(3, '0')}`,
            department: teacher.dept,
            hireDate: randomDate(new Date('2018-01-01'), new Date('2023-01-01')),
            salary: faker.number.float({ min: 45000, max: 75000, fractionDigits: 2 }),
            qualifications: `B.Ed ${teacher.subject}, Teaching Certificate`,
          },
        },
        clerkProfile: {
          create: {
            employeeId: `TCH${String(i + 1).padStart(3, '0')}`,
            department: teacher.dept,
            hireDate: randomDate(new Date('2018-01-01'), new Date('2023-01-01')),
            phone: faker.phone.number(),
            address: faker.location.streetAddress({ useFullAddress: true }),
          },
        },
      },
    })
    users.push(user)
  }

  // Create Students
  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    
    const student = await prisma.user.create({
      data: {
        clerkId: `user_student_${String(i + 1).padStart(3, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.greenwood.edu`,
        firstName,
        lastName,
        role: 'STUDENT',
        avatar: faker.image.avatar(),
        schoolId: schools[0].id,
        studentProfile: {
          create: {
            studentIdNumber: `STU${String(i + 1).padStart(4, '0')}`,
            dateOfBirth: randomDate(new Date('2005-01-01'), new Date('2010-12-31')),
            grade: faker.helpers.arrayElement(['9', '10', '11', '12']),
            emergencyContact: `${faker.person.fullName()} - ${faker.phone.number()}`,
            medicalInfo: faker.helpers.arrayElement(['None', 'Asthma', 'Allergies to nuts', 'Diabetes Type 1']),
            address: faker.location.streetAddress({ useFullAddress: true }),
          },
        },
      },
    })
    users.push(student)
  }

  // Create Parents
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    
    const parent = await prisma.user.create({
      data: {
        clerkId: `user_parent_${String(i + 1).padStart(3, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@parent.greenwood.edu`,
        firstName,
        lastName,
        role: 'PARENT',
        avatar: faker.image.avatar(),
        schoolId: schools[0].id,
        parentProfile: {
          create: {
            phone: faker.phone.number(),
            address: faker.location.streetAddress({ useFullAddress: true }),
            emergencyContact: `${faker.person.fullName()} - ${faker.phone.number()}`,
          },
        },
      },
    })
    users.push(parent)
  }

  // Create Clerk
  const clerk = await prisma.user.create({
    data: {
      clerkId: 'user_clerk_001',
      email: 'clerk@greenwood.edu',
      firstName: 'Amanda',
      lastName: 'Rodriguez',
      role: 'CLERK',
      avatar: faker.image.avatar(),
      schoolId: schools[0].id,
      clerkProfile: {
        create: {
          employeeId: 'CLK001',
          department: 'Administration',
          hireDate: new Date('2021-09-01'),
          phone: '+1-555-0301',
          address: '321 Clerk Street, Springfield, IL 62701',
        },
      },
    },
  })
  users.push(clerk)

  console.log('👥 Created users and profiles')

  // Get users by role for easier reference
  const students = users.filter(u => u.role === 'STUDENT')
  const teachers = users.filter(u => u.role === 'TEACHER')
  const parents = users.filter(u => u.role === 'PARENT')

  // 3. Create Parent-Child Relationships
  for (let i = 0; i < Math.min(parents.length, students.length); i++) {
    await prisma.parentChildRelationship.create({
      data: {
        parentId: parents[i].id,
        childId: students[i].id,
        relationship: 'PARENT',
      },
    })
  }

  console.log('👨‍👩‍👧‍👦 Created parent-child relationships')

  // 4. Create Subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Algebra, Geometry, and Calculus',
        schoolId: schools[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'English Literature',
        code: 'ENG',
        description: 'Reading, Writing, and Literature Analysis',
        schoolId: schools[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Biology',
        code: 'BIO',
        description: 'Life Sciences and Laboratory Work',
        schoolId: schools[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'World History',
        code: 'HIST',
        description: 'Ancient to Modern World History',
        schoolId: schools[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Physical Education',
        code: 'PE',
        description: 'Sports, Fitness, and Health',
        schoolId: schools[0].id,
      },
    }),
  ])

  console.log('📚 Created subjects')

  // 5. Create Classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Grade 9A',
        grade: '9',
        section: 'A',
        schoolId: schools[0].id,
      },
    }),
    prisma.class.create({
      data: {
        name: 'Grade 9B',
        grade: '9',
        section: 'B',
        schoolId: schools[0].id,
      },
    }),
    prisma.class.create({
      data: {
        name: 'Grade 10A',
        grade: '10',
        section: 'A',
        schoolId: schools[0].id,
      },
    }),
    prisma.class.create({
      data: {
        name: 'Grade 11A',
        grade: '11',
        section: 'A',
        schoolId: schools[0].id,
      },
    }),
    prisma.class.create({
      data: {
        name: 'Grade 12A',
        grade: '12',
        section: 'A',
        schoolId: schools[0].id,
      },
    }),
  ])

  console.log('🏛️ Created classes')

  // 6. Create ClassSubjects (assign teachers to class-subject combinations)
  const classSubjects = []
  for (let i = 0; i < classes.length; i++) {
    for (let j = 0; j < subjects.length; j++) {
      const teacherIndex = j % teachers.length
      const classSubject = await prisma.classSubject.create({
        data: {
          classId: classes[i].id,
          subjectId: subjects[j].id,
          teacherId: teachers[teacherIndex].id,
        },
      })
      classSubjects.push(classSubject)
    }
  }

  console.log('🎓 Created class-subject assignments')

  // 7. Create Student Enrollments
  for (let i = 0; i < students.length; i++) {
    const classIndex = Math.floor(i / 10) % classes.length
    await prisma.enrollment.create({
      data: {
        studentId: students[i].id,
        classId: classes[classIndex].id,
        enrolledAt: randomDate(new Date('2024-08-01'), new Date('2024-09-01')),
        status: 'ACTIVE',
      },
    })
  }

  console.log('📝 Created student enrollments')

  // 8. Create Terms
  const terms = await Promise.all([
    prisma.term.create({
      data: {
        name: 'Fall 2024',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-20'),
        isActive: true,
        schoolId: schools[0].id,
      },
    }),
    prisma.term.create({
      data: {
        name: 'Spring 2025',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-30'),
        isActive: false,
        schoolId: schools[0].id,
      },
    }),
  ])

  console.log('📅 Created terms')

  // Create Rooms
  const rooms = []
  for (let i = 0; i < 20; i++) {
    const room = await prisma.room.create({
      data: {
        name: `Room ${String(i + 101)}`,
        building: faker.helpers.arrayElement(['Main Building', 'Science Wing', 'Arts Building']),
        capacity: faker.number.int({ min: 20, max: 50 }),
        floor: faker.helpers.arrayElement(['Ground Floor', 'First Floor', 'Second Floor']),
        facilities: faker.helpers.arrayElements(['Projector', 'Whiteboard', 'Computer', 'Lab Equipment', 'Audio System'], { min: 1, max: 3 }),
        schoolId: schools[0].id,
      },
    })
    rooms.push(room)
  }

  console.log('🏢 Created rooms')

  // 10. Create Periods
  const periods = await Promise.all([
    prisma.period.create({
      data: {
        name: '1st Period',
        startTime: '08:00',
        endTime: '08:50',
        order: 1,
        schoolId: schools[0].id,
      },
    }),
    prisma.period.create({
      data: {
        name: '2nd Period',
        startTime: '09:00',
        endTime: '09:50',
        order: 2,
        schoolId: schools[0].id,
      },
    }),
    prisma.period.create({
      data: {
        name: '3rd Period',
        startTime: '10:00',
        endTime: '10:50',
        order: 3,
        schoolId: schools[0].id,
      },
    }),
    prisma.period.create({
      data: {
        name: 'Lunch Break',
        startTime: '11:00',
        endTime: '11:30',
        order: 4,
        schoolId: schools[0].id,
      },
    }),
    prisma.period.create({
      data: {
        name: '4th Period',
        startTime: '11:30',
        endTime: '12:20',
        order: 5,
        schoolId: schools[0].id,
      },
    }),
    prisma.period.create({
      data: {
        name: '5th Period',
        startTime: '12:30',
        endTime: '13:20',
        order: 6,
        schoolId: schools[0].id,
      },
    }),
  ])

  console.log('⏰ Created periods')

  console.log('✅ Database seeding completed successfully!')
  console.log(`Created:
  - ${schools.length} schools
  - ${users.length} users (1 principal, ${teachers.length} teachers, ${students.length} students, ${parents.length} parents, 1 clerk)
  - ${subjects.length} subjects
  - ${classes.length} classes
  - ${classSubjects.length} class-subject assignments
  - ${students.length} student enrollments
  - ${terms.length} terms
  - ${rooms.length} rooms
  - ${periods.length} periods`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
