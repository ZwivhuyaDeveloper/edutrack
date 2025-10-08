import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n')

  // ============================================
  // 1. CREATE SCHOOL
  // ============================================
  console.log('📚 Creating school...')
  const school = await prisma.school.create({
    data: {
      name: 'EduTrack Demo High School',
      address: '123 Education Boulevard',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'US',
      phone: '+1-555-0100',
      email: 'info@edutrackdemo.edu',
      website: 'https://edutrackdemo.edu',
      logo: 'https://via.placeholder.com/150',
      isActive: true,
    }
  })
  console.log('✅ Created school:', school.name)

  // ============================================
  // 2. CREATE USERS WITH PROFILES
  // ============================================
  console.log('\n👥 Creating users and profiles...')

  // Principal
  const principal = await prisma.user.create({
    data: {
      clerkId: 'clerk_principal_demo',
      email: 'principal@edutrackdemo.edu',
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      role: 'PRINCIPAL',
      schoolId: school.id,
      isActive: true,
      principalProfile: {
        create: {
          employeeId: 'EMP001',
          hireDate: new Date('2020-01-15'),
          phone: '+1-555-0101',
          address: '456 Principal Lane',
          qualifications: 'PhD in Educational Leadership',
          yearsOfExperience: 15,
          educationBackground: 'PhD from Harvard University',
          administrativeArea: 'Academic Affairs',
        }
      }
    }
  })

  // Teachers
  const teacher1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_teacher1_demo',
      email: 'john.smith@edutrackdemo.edu',
      firstName: 'John',
      lastName: 'Smith',
      role: 'TEACHER',
      schoolId: school.id,
      isActive: true,
      teacherProfile: {
        create: {
          employeeId: 'EMP002',
          department: 'Mathematics',
          hireDate: new Date('2021-08-01'),
          qualifications: 'MSc in Mathematics',
        }
      }
    }
  })

  const teacher2 = await prisma.user.create({
    data: {
      clerkId: 'clerk_teacher2_demo',
      email: 'emily.davis@edutrackdemo.edu',
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'TEACHER',
      schoolId: school.id,
      isActive: true,
      teacherProfile: {
        create: {
          employeeId: 'EMP003',
          department: 'English',
          hireDate: new Date('2020-09-01'),
          qualifications: 'MA in English Literature',
        }
      }
    }
  })

  const teacher3 = await prisma.user.create({
    data: {
      clerkId: 'clerk_teacher3_demo',
      email: 'michael.brown@edutrackdemo.edu',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'TEACHER',
      schoolId: school.id,
      isActive: true,
      teacherProfile: {
        create: {
          employeeId: 'EMP004',
          department: 'Science',
          hireDate: new Date('2019-08-15'),
          qualifications: 'MSc in Physics',
        }
      }
    }
  })

  // Clerk
  const clerk = await prisma.user.create({
    data: {
      clerkId: 'clerk_admin_demo',
      email: 'clerk@edutrackdemo.edu',
      firstName: 'Lisa',
      lastName: 'Anderson',
      role: 'CLERK',
      schoolId: school.id,
      isActive: true,
      clerkProfile: {
        create: {
          employeeId: 'EMP005',
          department: 'Administration',
          hireDate: new Date('2021-01-10'),
          phone: '+1-555-0105',
        }
      }
    }
  })

  // Students
  const student1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_student1_demo',
      email: 'alex.wilson@student.edutrackdemo.edu',
      firstName: 'Alex',
      lastName: 'Wilson',
      role: 'STUDENT',
      schoolId: school.id,
      isActive: true,
      studentProfile: {
        create: {
          dateOfBirth: new Date('2008-05-15'),
          grade: '10',
          studentIdNumber: 'STU001',
          emergencyContact: 'Parent: +1-555-0201',
          address: '789 Student Street',
        }
      }
    }
  })

  const student2 = await prisma.user.create({
    data: {
      clerkId: 'clerk_student2_demo',
      email: 'emma.martinez@student.edutrackdemo.edu',
      firstName: 'Emma',
      lastName: 'Martinez',
      role: 'STUDENT',
      schoolId: school.id,
      isActive: true,
      studentProfile: {
        create: {
          dateOfBirth: new Date('2008-08-22'),
          grade: '10',
          studentIdNumber: 'STU002',
          emergencyContact: 'Parent: +1-555-0202',
          address: '321 Oak Avenue',
        }
      }
    }
  })

  const student3 = await prisma.user.create({
    data: {
      clerkId: 'clerk_student3_demo',
      email: 'james.taylor@student.edutrackdemo.edu',
      firstName: 'James',
      lastName: 'Taylor',
      role: 'STUDENT',
      schoolId: school.id,
      isActive: true,
      studentProfile: {
        create: {
          dateOfBirth: new Date('2007-03-10'),
          grade: '11',
          studentIdNumber: 'STU003',
          emergencyContact: 'Parent: +1-555-0203',
          address: '654 Maple Drive',
        }
      }
    }
  })

  // Parents
  const parent1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_parent1_demo',
      email: 'parent.wilson@edutrackdemo.edu',
      firstName: 'Robert',
      lastName: 'Wilson',
      role: 'PARENT',
      schoolId: school.id,
      isActive: true,
      parentProfile: {
        create: {
          phone: '+1-555-0201',
          address: '789 Student Street',
          emergencyContact: '+1-555-0299',
        }
      }
    }
  })

  const parent2 = await prisma.user.create({
    data: {
      clerkId: 'clerk_parent2_demo',
      email: 'parent.martinez@edutrackdemo.edu',
      firstName: 'Maria',
      lastName: 'Martinez',
      role: 'PARENT',
      schoolId: school.id,
      isActive: true,
      parentProfile: {
        create: {
          phone: '+1-555-0202',
          address: '321 Oak Avenue',
          emergencyContact: '+1-555-0298',
        }
      }
    }
  })

  console.log('✅ Created users: 1 Principal, 3 Teachers, 1 Clerk, 3 Students, 2 Parents')

  // ============================================
  // 3. CREATE PARENT-CHILD RELATIONSHIPS
  // ============================================
  console.log('\n👨‍👩‍👧‍👦 Creating parent-child relationships...')
  await prisma.parentChildRelationship.createMany({
    data: [
      { parentId: parent1.id, childId: student1.id, relationship: 'PARENT' },
      { parentId: parent2.id, childId: student2.id, relationship: 'PARENT' },
    ]
  })
  console.log('✅ Created 2 parent-child relationships')

  // ============================================
  // 4. CREATE SUBJECTS
  // ============================================
  console.log('\n📖 Creating subjects...')
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Algebra II',
        code: 'MATH201',
        description: 'Advanced Algebra and Functions',
        schoolId: school.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'English Literature',
        code: 'ENG201',
        description: 'American and British Literature',
        schoolId: school.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Physics',
        code: 'SCI301',
        description: 'Introduction to Physics',
        schoolId: school.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'World History',
        code: 'HIST201',
        description: 'Modern World History',
        schoolId: school.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Chemistry',
        code: 'SCI201',
        description: 'General Chemistry',
        schoolId: school.id
      }
    })
  ])
  console.log('✅ Created 5 subjects')

  // ============================================
  // 5. CREATE CLASSES
  // ============================================
  console.log('\n🏫 Creating classes...')
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Grade 10A',
        grade: '10',
        section: 'A',
        schoolId: school.id
      }
    }),
    prisma.class.create({
      data: {
        name: 'Grade 10B',
        grade: '10',
        section: 'B',
        schoolId: school.id
      }
    }),
    prisma.class.create({
      data: {
        name: 'Grade 11A',
        grade: '11',
        section: 'A',
        schoolId: school.id
      }
    })
  ])
  console.log('✅ Created 3 classes')

  // ============================================
  // 6. CREATE TERMS
  // ============================================
  console.log('\n📅 Creating academic terms...')
  const term = await prisma.term.create({
    data: {
      name: 'Fall 2024',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-20'),
      isActive: true,
      schoolId: school.id
    }
  })
  console.log('✅ Created term:', term.name)

  // ============================================
  // 7. CREATE CLASS-SUBJECT MAPPINGS
  // ============================================
  console.log('\n🔗 Creating class-subject mappings...')
  const classSubjects = await Promise.all([
    // Grade 10A
    prisma.classSubject.create({
      data: {
        classId: classes[0].id,
        subjectId: subjects[0].id, // Algebra II
        teacherId: teacher1.id
      }
    }),
    prisma.classSubject.create({
      data: {
        classId: classes[0].id,
        subjectId: subjects[1].id, // English Literature
        teacherId: teacher2.id
      }
    }),
    // Grade 11A
    prisma.classSubject.create({
      data: {
        classId: classes[2].id,
        subjectId: subjects[2].id, // Physics
        teacherId: teacher3.id
      }
    }),
  ])
  console.log('✅ Created 3 class-subject mappings')

  // ============================================
  // 8. CREATE ENROLLMENTS
  // ============================================
  console.log('\n📝 Creating student enrollments...')
  await prisma.enrollment.createMany({
    data: [
      { studentId: student1.id, classId: classes[0].id, status: 'ACTIVE' },
      { studentId: student2.id, classId: classes[0].id, status: 'ACTIVE' },
      { studentId: student3.id, classId: classes[2].id, status: 'ACTIVE' },
    ]
  })
  console.log('✅ Created 3 enrollments')

  // ============================================
  // 9. CREATE ROOMS AND PERIODS
  // ============================================
  console.log('\n🏢 Creating rooms and periods...')
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Room 101',
        building: 'Main Building',
        capacity: 30,
        floor: '1',
        facilities: ['Projector', 'Whiteboard', 'Computer'],
        schoolId: school.id
      }
    }),
    prisma.room.create({
      data: {
        name: 'Lab 201',
        building: 'Science Wing',
        capacity: 25,
        floor: '2',
        facilities: ['Lab Equipment', 'Safety Gear', 'Projector'],
        schoolId: school.id
      }
    })
  ])

  const periods = await Promise.all([
    prisma.period.create({
      data: {
        name: 'Period 1',
        startTime: '08:00',
        endTime: '09:00',
        order: 1,
        schoolId: school.id
      }
    }),
    prisma.period.create({
      data: {
        name: 'Period 2',
        startTime: '09:15',
        endTime: '10:15',
        order: 2,
        schoolId: school.id
      }
    }),
    prisma.period.create({
      data: {
        name: 'Period 3',
        startTime: '10:30',
        endTime: '11:30',
        order: 3,
        schoolId: school.id
      }
    })
  ])
  console.log('✅ Created 2 rooms and 3 periods')

  // ============================================
  // 10. CREATE CLASS MEETINGS (SCHEDULE)
  // ============================================
  console.log('\n🗓️  Creating class schedule...')
  await prisma.classMeeting.createMany({
    data: [
      // Monday - Algebra II
      { classSubjectId: classSubjects[0].id, periodId: periods[0].id, roomId: rooms[0].id, dayOfWeek: 1 },
      // Tuesday - English Literature
      { classSubjectId: classSubjects[1].id, periodId: periods[1].id, roomId: rooms[0].id, dayOfWeek: 2 },
      // Wednesday - Physics
      { classSubjectId: classSubjects[2].id, periodId: periods[2].id, roomId: rooms[1].id, dayOfWeek: 3 },
    ]
  })
  console.log('✅ Created 3 class meetings')

  // ============================================
  // 11. CREATE ASSIGNMENTS
  // ============================================
  console.log('\n📚 Creating assignments...')
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        title: 'Quadratic Equations Homework',
        description: 'Solve problems 1-20 from Chapter 5',
        dueDate: new Date('2024-10-15'),
        maxPoints: 100,
        classId: classes[0].id,
        subjectId: subjects[0].id,
        termId: term.id
      }
    }),
    prisma.assignment.create({
      data: {
        title: 'Shakespeare Essay',
        description: 'Write a 500-word essay on Hamlet',
        dueDate: new Date('2024-10-20'),
        maxPoints: 100,
        classId: classes[0].id,
        subjectId: subjects[1].id,
        termId: term.id
      }
    }),
    prisma.assignment.create({
      data: {
        title: 'Physics Lab Report',
        description: 'Submit lab report on Newton\'s Laws',
        dueDate: new Date('2024-10-25'),
        maxPoints: 100,
        classId: classes[2].id,
        subjectId: subjects[2].id,
        termId: term.id
      }
    })
  ])
  console.log('✅ Created 3 assignments')

  // ============================================
  // 12. CREATE ASSIGNMENT SUBMISSIONS
  // ============================================
  console.log('\n✍️  Creating assignment submissions...')
  await prisma.assignmentSubmission.createMany({
    data: [
      {
        assignmentId: assignments[0].id,
        studentId: student1.id,
        content: 'Completed all 20 problems',
        submittedAt: new Date('2024-10-14'),
        grade: 95,
        feedback: 'Excellent work!'
      },
      {
        assignmentId: assignments[1].id,
        studentId: student2.id,
        content: 'Essay on Hamlet\'s character development',
        submittedAt: new Date('2024-10-19'),
        grade: 88,
        feedback: 'Good analysis, needs more examples'
      }
    ]
  })
  console.log('✅ Created 2 assignment submissions')

  // ============================================
  // 13. CREATE GRADE CATEGORIES AND ITEMS
  // ============================================
  console.log('\n📊 Creating grade categories and items...')
  const gradeCategory = await prisma.gradeCategory.create({
    data: {
      name: 'Homework',
      weight: 30,
      description: 'Regular homework assignments',
      classSubjectId: classSubjects[0].id
    }
  })

  const gradeItem = await prisma.gradeItem.create({
    data: {
      name: 'Homework 1',
      description: 'First homework assignment',
      maxPoints: 100,
      date: new Date('2024-10-01'),
      classSubjectId: classSubjects[0].id,
      categoryId: gradeCategory.id,
      assignmentId: assignments[0].id
    }
  })

  await prisma.grade.create({
    data: {
      points: 95,
      feedback: 'Great work!',
      gradeItemId: gradeItem.id,
      studentId: student1.id,
      teacherId: teacher1.id
    }
  })
  console.log('✅ Created grade categories, items, and grades')

  // ============================================
  // 14. CREATE ATTENDANCE RECORDS
  // ============================================
  console.log('\n✅ Creating attendance records...')
  const attendanceSession = await prisma.attendanceSession.create({
    data: {
      date: new Date('2024-10-01'),
      notes: 'Regular class session',
      classSubjectId: classSubjects[0].id,
      createdById: teacher1.id
    }
  })

  await prisma.attendance.createMany({
    data: [
      { sessionId: attendanceSession.id, studentId: student1.id, status: 'PRESENT' },
      { sessionId: attendanceSession.id, studentId: student2.id, status: 'PRESENT' },
    ]
  })
  console.log('✅ Created attendance session and records')

  // ============================================
  // 15. CREATE RESOURCES
  // ============================================
  console.log('\n📁 Creating resources...')
  const resource = await prisma.resource.create({
    data: {
      title: 'Algebra II Study Guide',
      description: 'Comprehensive study guide for Algebra II',
      url: 'https://example.com/algebra-guide.pdf',
      type: 'DOCUMENT',
      visibility: 'CLASS',
      schoolId: school.id,
      ownerId: teacher1.id
    }
  })

  const resourceTag = await prisma.resourceTag.create({
    data: { name: 'Mathematics' }
  })

  await prisma.resourceTagJoin.create({
    data: {
      resourceId: resource.id,
      tagId: resourceTag.id
    }
  })

  await prisma.resourceLink.create({
    data: {
      resourceId: resource.id,
      classSubjectId: classSubjects[0].id
    }
  })
  console.log('✅ Created resources with tags and links')

  // ============================================
  // 16. CREATE EVENTS
  // ============================================
  console.log('\n🎉 Creating events...')
  const event = await prisma.event.create({
    data: {
      title: 'Parent-Teacher Conference',
      description: 'Fall semester parent-teacher meetings',
      startDate: new Date('2024-11-15T14:00:00'),
      endDate: new Date('2024-11-15T18:00:00'),
      location: 'School Auditorium',
      type: 'PARENT_TEACHER',
      isAllDay: false,
      schoolId: school.id,
      createdById: principal.id
    }
  })

  await prisma.eventAudience.create({
    data: {
      scope: 'SCHOOL',
      eventId: event.id
    }
  })
  console.log('✅ Created school event')

  // ============================================
  // 17. CREATE CONVERSATIONS AND MESSAGES
  // ============================================
  console.log('\n💬 Creating conversations and messages...')
  const conversation = await prisma.conversation.create({
    data: {
      title: 'Math Class Discussion',
      isGroup: false,
      schoolId: school.id
    }
  })

  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conversation.id, userId: teacher1.id },
      { conversationId: conversation.id, userId: parent1.id }
    ]
  })

  await prisma.message.create({
    data: {
      content: 'Hello, I wanted to discuss Alex\'s progress in math class.',
      status: 'SENT',
      conversationId: conversation.id,
      senderId: parent1.id,
      recipientId: teacher1.id
    }
  })
  console.log('✅ Created conversation and message')

  // ============================================
  // 18. CREATE LESSON PLANS
  // ============================================
  console.log('\n📝 Creating lesson plans...')
  await prisma.lessonPlan.create({
    data: {
      title: 'Introduction to Quadratic Equations',
      date: new Date('2024-10-01'),
      objectives: 'Students will understand the basics of quadratic equations',
      materials: 'Textbook, whiteboard, calculator',
      activities: 'Lecture, practice problems, group work',
      homework: 'Problems 1-10 from Chapter 5',
      status: 'PUBLISHED',
      classSubjectId: classSubjects[0].id,
      teacherId: teacher1.id
    }
  })
  console.log('✅ Created lesson plan')

  // ============================================
  // 19. CREATE FEE RECORDS AND PAYMENTS
  // ============================================
  console.log('\n💰 Creating fee records and payments...')
  const studentAccount = await prisma.studentAccount.create({
    data: {
      studentId: student1.id,
      balance: 500
    }
  })

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      status: 'PENDING',
      dueDate: new Date('2024-11-01'),
      total: 500,
      notes: 'Fall semester tuition',
      accountId: studentAccount.id
    }
  })

  await prisma.invoiceItem.create({
    data: {
      description: 'Tuition Fee',
      quantity: 1,
      unitPrice: 500,
      total: 500,
      invoiceId: invoice.id
    }
  })

  const clerkProfileId = await prisma.clerkProfile.findUnique({
    where: { clerkId: clerk.id },
    select: { id: true }
  })

  await prisma.feeRecord.create({
    data: {
      description: 'Fall Semester Tuition',
      amount: 500,
      dueDate: new Date('2024-11-01'),
      paid: false,
      studentId: student1.id,
      clerkId: clerkProfileId?.id
    }
  })
  console.log('✅ Created fee records and invoices')

  // ============================================
  // 20. CREATE ANNOUNCEMENTS AND NOTIFICATIONS
  // ============================================
  console.log('\n📢 Creating announcements and notifications...')
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Fall 2024',
      content: 'Welcome back students! We hope you have a great semester.',
      scope: 'SCHOOL',
      priority: 'normal',
      schoolId: school.id,
      createdById: principal.id,
      publishedAt: new Date()
    }
  })

  await prisma.notification.create({
    data: {
      title: 'New Assignment Posted',
      content: 'Your teacher has posted a new assignment in Algebra II',
      type: 'ASSIGNMENT',
      isRead: false,
      userId: student1.id
    }
  })
  console.log('✅ Created announcements and notifications')

  // ============================================
  // 21. CREATE AUDIT LOG
  // ============================================
  console.log('\n📋 Creating audit log entries...')
  await prisma.auditLog.create({
    data: {
      entity: 'Assignment',
      entityId: assignments[0].id,
      action: 'CREATE',
      changes: { title: 'Quadratic Equations Homework' },
      actorId: teacher1.id,
      ipAddress: '192.168.1.1'
    }
  })
  console.log('✅ Created audit log entries')

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📊 Summary of Created Data:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ 1 School')
  console.log('✅ 9 Users (1 Principal, 3 Teachers, 1 Clerk, 3 Students, 2 Parents)')
  console.log('✅ 2 Parent-Child Relationships')
  console.log('✅ 5 Subjects')
  console.log('✅ 3 Classes')
  console.log('✅ 1 Term')
  console.log('✅ 3 Class-Subject Mappings')
  console.log('✅ 3 Enrollments')
  console.log('✅ 2 Rooms & 3 Periods')
  console.log('✅ 3 Class Meetings')
  console.log('✅ 3 Assignments & 2 Submissions')
  console.log('✅ Grade Categories, Items & Grades')
  console.log('✅ Attendance Sessions & Records')
  console.log('✅ Resources with Tags')
  console.log('✅ Events & Audiences')
  console.log('✅ Conversations & Messages')
  console.log('✅ Lesson Plans')
  console.log('✅ Fee Records & Invoices')
  console.log('✅ Announcements & Notifications')
  console.log('✅ Audit Logs')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n💡 Next Steps:')
  console.log('1. Run: npx prisma migrate dev')
  console.log('2. Set up Clerk authentication')
  console.log('3. Update Clerk IDs in the database after user registration')
  console.log('4. Start the development server: npm run dev')
  console.log('\n📧 Demo User Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Principal: principal@edutrackdemo.edu')
  console.log('Teacher:   john.smith@edutrackdemo.edu')
  console.log('Student:   alex.wilson@student.edutrackdemo.edu')
  console.log('Parent:    parent.wilson@edutrackdemo.edu')
  console.log('Clerk:     clerk@edutrackdemo.edu')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


