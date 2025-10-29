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

  const SCHOOL_ID = 'cmh2izv8q00005kedyof0ud33'

  // 1. Upsert School (never delete, only create or update)
  const school = await prisma.school.upsert({
    where: { id: SCHOOL_ID },
    update: {
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
    create: {
      id: SCHOOL_ID,
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
  })

  const schools = [school]

  console.log('🏫 Upserted school')

  // 2. Create Users with Profiles (check if exists first)
  const users = []
  
  // Upsert Principal
  let principal = await prisma.user.findUnique({
    where: { clerkId: 'user_principal_001' },
  })

  if (!principal) {
    principal = await prisma.user.create({
      data: {
        clerkId: 'user_principal_001',
        email: 'principal@greenwood.edu',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'PRINCIPAL',
        avatar: faker.image.avatar(),
        schoolId: SCHOOL_ID,
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
  }
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
    const clerkId = `user_teacher_${String(i + 1).padStart(3, '0')}`
    
    let user = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@greenwood.edu`,
          firstName,
          lastName,
          role: 'TEACHER',
          avatar: faker.image.avatar(),
          schoolId: SCHOOL_ID,
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
    }
    users.push(user)
  }

  // Create Students (only if they don't exist)
  const existingStudents = await prisma.user.findMany({
    where: { 
      role: 'STUDENT',
      schoolId: SCHOOL_ID
    }
  })
  
  const studentsToCreate = Math.max(0, 50 - existingStudents.length)
  
  for (let i = 0; i < studentsToCreate; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const studentNum = existingStudents.length + i + 1
    const clerkId = `user_student_${String(studentNum).padStart(3, '0')}`
    
    const student = await prisma.user.create({
      data: {
        clerkId,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.greenwood.edu`,
        firstName,
        lastName,
        role: 'STUDENT',
        avatar: faker.image.avatar(),
        schoolId: SCHOOL_ID,
        studentProfile: {
          create: {
            studentIdNumber: `STU${String(studentNum).padStart(4, '0')}`,
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
  
  users.push(...existingStudents)

  // Create Parents (only if they don't exist)
  const existingParents = await prisma.user.findMany({
    where: { 
      role: 'PARENT',
      schoolId: SCHOOL_ID
    }
  })
  
  const parentsToCreate = Math.max(0, 30 - existingParents.length)
  
  for (let i = 0; i < parentsToCreate; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const parentNum = existingParents.length + i + 1
    const clerkId = `user_parent_${String(parentNum).padStart(3, '0')}`
    
    const parent = await prisma.user.create({
      data: {
        clerkId,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@parent.greenwood.edu`,
        firstName,
        lastName,
        role: 'PARENT',
        avatar: faker.image.avatar(),
        schoolId: SCHOOL_ID,
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
  
  users.push(...existingParents)

  // Upsert Clerk
  let clerk = await prisma.user.findUnique({
    where: { clerkId: 'user_clerk_001' },
  })

  if (!clerk) {
    clerk = await prisma.user.create({
      data: {
        clerkId: 'user_clerk_001',
        email: 'clerk@greenwood.edu',
        firstName: 'Amanda',
        lastName: 'Rodriguez',
        role: 'CLERK',
        avatar: faker.image.avatar(),
        schoolId: SCHOOL_ID,
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
  }
  users.push(clerk)

  console.log('👥 Created users and profiles')

  // Get clerk profile for fee records
  const clerkProfile = await prisma.clerkProfile.findUnique({
    where: { clerkId: clerk.id },
  })

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

  // 4. Create Subjects (only if they don't exist)
  const subjectData = [
    { code: 'MATH', name: 'Mathematics', description: 'Algebra, Geometry, and Calculus' },
    { code: 'ENG', name: 'English Literature', description: 'Reading, Writing, and Literature Analysis' },
    { code: 'BIO', name: 'Biology', description: 'Life Sciences and Laboratory Work' },
    { code: 'HIST', name: 'World History', description: 'Ancient to Modern World History' },
    { code: 'PE', name: 'Physical Education', description: 'Sports, Fitness, and Health' },
  ]

  const subjects = []
  for (const subj of subjectData) {
    let subject = await prisma.subject.findFirst({
      where: { 
        code: subj.code,
        schoolId: SCHOOL_ID
      }
    })

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          code: subj.code,
          name: subj.name,
          description: subj.description,
          schoolId: SCHOOL_ID,
        },
      })
    }
    subjects.push(subject)
  }

  console.log('📚 Created/found subjects')

  // 5. Create Classes (only if they don't exist)
  const classData = [
    { name: 'Grade 9A', grade: '9', section: 'A' },
    { name: 'Grade 9B', grade: '9', section: 'B' },
    { name: 'Grade 10A', grade: '10', section: 'A' },
    { name: 'Grade 11A', grade: '11', section: 'A' },
    { name: 'Grade 12A', grade: '12', section: 'A' },
  ]

  const classes = []
  for (const cls of classData) {
    let classObj = await prisma.class.findFirst({
      where: {
        name: cls.name,
        schoolId: SCHOOL_ID
      }
    })

    if (!classObj) {
      classObj = await prisma.class.create({
        data: {
          name: cls.name,
          grade: cls.grade,
          section: cls.section,
          schoolId: SCHOOL_ID,
        },
      })
    }
    classes.push(classObj)
  }

  console.log('🏛️ Created/found classes')

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

  // 11. Create Attendance Sessions and Records
  const attendanceSessions = []
  for (let i = 0; i < 10; i++) {
    const classSubject = faker.helpers.arrayElement(classSubjects)
    const sessionDate = randomDate(new Date('2024-09-01'), new Date('2024-10-13'))
    
    const session = await prisma.attendanceSession.create({
      data: {
        date: sessionDate,
        notes: faker.helpers.arrayElement(['Regular class', 'Quiz day', 'Lab session', null]),
        classSubjectId: classSubject.id,
        createdById: classSubject.teacherId,
      },
    })
    attendanceSessions.push(session)

    // Create attendance records for students in this class
    const classEnrollments = await prisma.enrollment.findMany({
      where: { classId: classSubject.classId },
    })

    for (const enrollment of classEnrollments) {
      await prisma.attendance.create({
        data: {
          sessionId: session.id,
          studentId: enrollment.studentId,
          status: faker.helpers.arrayElement(['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
          notes: faker.helpers.arrayElement([null, null, null, 'Doctor appointment', 'Family emergency']),
        },
      })
    }
  }

  console.log('📊 Created attendance sessions and records')

  // 12. Create Pending Fees
  const feeRecords = []
  for (let i = 0; i < 30; i++) {
    const student = faker.helpers.arrayElement(students)
    const isPaid = faker.datatype.boolean()
    const dueDate = randomDate(new Date('2024-09-01'), new Date('2024-12-31'))
    
    const feeRecord = await prisma.fee_records.create({
      data: {
        id: faker.string.uuid(),
        description: faker.helpers.arrayElement([
          'Tuition Fee - Fall 2024',
          'Library Fee',
          'Lab Fee',
          'Sports Fee',
          'Activity Fee',
          'Transportation Fee',
          'Exam Fee',
        ]),
        amount: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
        dueDate: dueDate,
        paid: isPaid,
        paidAt: isPaid ? randomDate(dueDate, new Date()) : null,
        studentId: student.id,
        clerkId: isPaid && clerkProfile ? clerkProfile.id : null,
        updatedAt: new Date(),
      },
    })
    feeRecords.push(feeRecord)
  }

  console.log('💰 Created fee records')

  // 13. Create Upcoming Events
  const events = []
  
  for (let i = 0; i < 15; i++) {
    const startDate = randomDate(new Date('2024-10-14'), new Date('2024-12-31'))
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + faker.number.int({ min: 1, max: 4 }))
    
    const event = await prisma.event.create({
      data: {
        title: faker.helpers.arrayElement([
          'Annual Sports Day',
          'Parent-Teacher Meeting',
          'Science Fair',
          'Mid-term Exams',
          'Cultural Festival',
          'Thanksgiving Holiday',
          'Winter Break',
          'Math Competition',
          'School Assembly',
          'Career Day',
          'Art Exhibition',
          'Music Concert',
          'Debate Competition',
          'Field Trip',
          'Graduation Ceremony',
        ]),
        description: faker.lorem.sentence(),
        startDate: startDate,
        endDate: endDate,
        location: faker.helpers.arrayElement(['Main Hall', 'Auditorium', 'Sports Ground', 'Cafeteria', 'Library', 'Classroom 101']),
        type: faker.helpers.arrayElement(['HOLIDAY', 'EXAM', 'MEETING', 'SPORTS', 'CULTURAL', 'PARENT_TEACHER', 'OTHER']),
        isAllDay: faker.datatype.boolean(),
        schoolId: schools[0].id,
        createdById: principal.id,
      },
    })
    events.push(event)

    // Create event audiences
    const scope = faker.helpers.arrayElement(['SCHOOL', 'CLASS', 'SUBJECT'])
    if (scope === 'SCHOOL') {
      await prisma.eventAudience.create({
        data: {
          eventId: event.id,
          scope: 'SCHOOL',
        },
      })
    } else if (scope === 'CLASS') {
      await prisma.eventAudience.create({
        data: {
          eventId: event.id,
          scope: 'CLASS',
          classId: faker.helpers.arrayElement(classes).id,
        },
      })
    } else if (scope === 'SUBJECT') {
      await prisma.eventAudience.create({
        data: {
          eventId: event.id,
          scope: 'SUBJECT',
          subjectId: faker.helpers.arrayElement(subjects).id,
        },
      })
    }
  }

  console.log('📅 Created events')

  // 14. Create Conversations and Messages
  const conversations = []
  
  // Create group conversations
  for (let i = 0; i < 5; i++) {
    const conversation = await prisma.conversation.create({
      data: {
        title: faker.helpers.arrayElement([
          'Grade 9A - Class Discussion',
          'Teachers Group',
          'Parent Committee',
          'Sports Team',
          'Science Club',
        ]),
        isGroup: true,
        schoolId: schools[0].id,
      },
    })
    conversations.push(conversation)

    // Add participants
    const participantCount = faker.number.int({ min: 3, max: 8 })
    const selectedUsers = faker.helpers.arrayElements(users, participantCount)
    
    for (const user of selectedUsers) {
      await prisma.conversationParticipant.create({
        data: {
          conversationId: conversation.id,
          userId: user.id,
          lastReadAt: faker.datatype.boolean() ? randomDate(new Date('2024-10-01'), new Date('2024-10-12')) : null,
        },
      })
    }

    // Create messages in this conversation
    const messageCount = faker.number.int({ min: 5, max: 15 })
    for (let j = 0; j < messageCount; j++) {
      const sender = faker.helpers.arrayElement(selectedUsers)
      const isRead = faker.datatype.boolean()
      
      await prisma.message.create({
        data: {
          content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
          status: isRead ? faker.helpers.arrayElement(['DELIVERED', 'READ']) : 'SENT',
          conversationId: conversation.id,
          senderId: sender.id,
          sentAt: randomDate(new Date('2024-10-01'), new Date('2024-10-13')),
        },
      })
    }
  }

  // Create direct conversations
  for (let i = 0; i < 20; i++) {
    const user1 = faker.helpers.arrayElement(users)
    let user2 = faker.helpers.arrayElement(users)
    while (user2.id === user1.id) {
      user2 = faker.helpers.arrayElement(users)
    }

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        schoolId: schools[0].id,
      },
    })
    conversations.push(conversation)

    // Add two participants
    await prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        userId: user1.id,
        lastReadAt: faker.datatype.boolean() ? randomDate(new Date('2024-10-01'), new Date('2024-10-12')) : null,
      },
    })

    await prisma.conversationParticipant.create({
      data: {
        conversationId: conversation.id,
        userId: user2.id,
        lastReadAt: faker.datatype.boolean() ? randomDate(new Date('2024-10-01'), new Date('2024-10-12')) : null,
      },
    })

    // Create messages
    const messageCount = faker.number.int({ min: 2, max: 10 })
    for (let j = 0; j < messageCount; j++) {
      const sender = faker.helpers.arrayElement([user1, user2])
      const recipient = sender.id === user1.id ? user2 : user1
      const isRead = faker.datatype.boolean()
      
      await prisma.message.create({
        data: {
          content: faker.lorem.sentences(faker.number.int({ min: 1, max: 2 })),
          status: isRead ? faker.helpers.arrayElement(['DELIVERED', 'READ']) : 'SENT',
          conversationId: conversation.id,
          senderId: sender.id,
          recipientId: recipient.id,
          sentAt: randomDate(new Date('2024-10-01'), new Date('2024-10-13')),
        },
      })
    }
  }

  console.log('💬 Created conversations and messages')

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
  - ${periods.length} periods
  - ${attendanceSessions.length} attendance sessions
  - ${feeRecords.length} fee records
  - ${events.length} events
  - ${conversations.length} conversations`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
