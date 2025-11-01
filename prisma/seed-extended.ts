import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper functions for extended seeding

async function seedAdditionalData() {
  console.log('🌱 Adding additional seed data...')

  const SCHOOL_ID = 'cmhdqyqcc00001ne7owvn5d2f'

  // Get existing data for the specific school
  const school = await prisma.school.findUnique({ where: { id: SCHOOL_ID } })
  
  if (!school) {
    console.error('❌ School not found. Please run seed.ts first.')
    return
  }

  const users = await prisma.user.findMany({ 
    where: { schoolId: SCHOOL_ID },
    include: { studentProfile: true, clerkProfile: true } 
  })
  const classes = await prisma.class.findMany({ where: { schoolId: SCHOOL_ID } })
  const subjects = await prisma.subject.findMany({ where: { schoolId: SCHOOL_ID } })
  const classSubjects = await prisma.classSubject.findMany({
    where: {
      class: { schoolId: SCHOOL_ID }
    }
  })
  const terms = await prisma.term.findMany({ where: { schoolId: SCHOOL_ID } })
  const rooms = await prisma.room.findMany({ where: { schoolId: SCHOOL_ID } })
  const periods = await prisma.period.findMany({ where: { schoolId: SCHOOL_ID } })

  const students = users.filter(u => u.role === 'STUDENT')
  const principal = users.find(u => u.role === 'PRINCIPAL')
  const clerk = users.find(u => u.role === 'CLERK')
  
  if (!principal || !clerk) {
    console.error('❌ Principal or Clerk not found. Please run seed.ts first.')
    return
  }

  // 11. Create Class Meetings (Timetable)
  for (const classSubject of classSubjects) {
    // Each class-subject meets 3 times a week
    const daysOfWeek = faker.helpers.arrayElements([1, 2, 3, 4, 5], { min: 2, max: 3 })
    
    for (const day of daysOfWeek) {
      const period = faker.helpers.arrayElement(periods.slice(0, -2)) // Exclude lunch and last period
      const room = faker.helpers.arrayElement(rooms)
      
      await prisma.classMeeting.create({
        data: {
          dayOfWeek: day,
          classSubjectId: classSubject.id,
          periodId: period.id,
          roomId: room.id,
        },
      })
    }
  }

  console.log('📅 Created class meetings (timetable)')

  // 12. Create Assignments
  const assignments = []
  for (const classSubject of classSubjects) {
    // Create 3-5 assignments per class-subject
    const assignmentCount = faker.number.int({ min: 3, max: 5 })
    
    for (let i = 0; i < assignmentCount; i++) {
      const assignment = await prisma.assignment.create({
        data: {
          title: faker.helpers.arrayElement([
            'Chapter Review Questions',
            'Research Project',
            'Lab Report',
            'Essay Assignment',
            'Problem Set',
            'Group Presentation',
            'Quiz Preparation',
            'Creative Writing',
            'Data Analysis',
            'Case Study'
          ]),
          description: faker.lorem.paragraph(),
          dueDate: randomDate(new Date('2024-10-01'), new Date('2024-12-15')),
          maxPoints: faker.number.float({ min: 50, max: 100, fractionDigits: 1 }),
          classId: classSubject.classId,
          subjectId: classSubject.subjectId,
          termId: terms[0].id,
        },
      })
      assignments.push(assignment)
    }
  }

  console.log('📋 Created assignments')

  // 13. Create Assignment Submissions
  for (const assignment of assignments) {
    // Get students enrolled in this class
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: assignment.classId },
    })
    
    // 70-90% of students submit assignments
    const submissionRate = faker.number.float({ min: 0.7, max: 0.9 })
    const studentsToSubmit = faker.helpers.arrayElements(
      enrollments,
      Math.floor(enrollments.length * submissionRate)
    )
    
    for (const enrollment of studentsToSubmit) {
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: assignment.id,
          studentId: enrollment.studentId,
          content: faker.lorem.paragraphs(2),
          attachments: faker.helpers.arrayElements([
            'document.pdf',
            'presentation.pptx',
            'spreadsheet.xlsx',
            'image.jpg'
          ], { min: 0, max: 2 }),
          submittedAt: randomDate(new Date(assignment.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000), assignment.dueDate),
          grade: faker.number.float({ min: 60, max: 100, fractionDigits: 1 }),
          feedback: faker.lorem.sentence(),
        },
      })
    }
  }

  console.log('📝 Created assignment submissions')

  // 14. Create Grade Categories
  const gradeCategories = []
  for (const classSubject of classSubjects) {
    const categories = [
      { name: 'Assignments', weight: 0.4 },
      { name: 'Quizzes', weight: 0.2 },
      { name: 'Exams', weight: 0.3 },
      { name: 'Participation', weight: 0.1 },
    ]
    
    for (const category of categories) {
      const gradeCategory = await prisma.gradeCategory.create({
        data: {
          name: category.name,
          weight: category.weight,
          description: `${category.name} for ${classSubject.id}`,
          classSubjectId: classSubject.id,
        },
      })
      gradeCategories.push(gradeCategory)
    }
  }

  console.log('📊 Created grade categories')

  // 15. Create Grade Items and Grades
  for (const classSubject of classSubjects) {
    const categories = gradeCategories.filter(gc => gc.classSubjectId === classSubject.id)
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: classSubject.classId },
    })
    
    for (const category of categories) {
      // Create 2-4 grade items per category
      const itemCount = faker.number.int({ min: 2, max: 4 })
      
      for (let i = 0; i < itemCount; i++) {
        const gradeItem = await prisma.gradeItem.create({
          data: {
            name: `${category.name} ${i + 1}`,
            description: faker.lorem.sentence(),
            maxPoints: faker.number.float({ min: 50, max: 100, fractionDigits: 1 }),
            date: randomDate(new Date('2024-09-01'), new Date('2024-11-30')),
            classSubjectId: classSubject.id,
            categoryId: category.id,
          },
        })
        
        // Create grades for each enrolled student
        for (const enrollment of enrollments) {
          await prisma.grade.create({
            data: {
              points: faker.number.float({ min: Math.min(60, gradeItem.maxPoints * 0.6), max: gradeItem.maxPoints, fractionDigits: 1 }),
              feedback: faker.helpers.arrayElement([
                'Excellent work!',
                'Good effort',
                'Needs improvement',
                'Well done',
                'Keep it up',
                null
              ]),
              gradeItemId: gradeItem.id,
              studentId: enrollment.studentId,
              teacherId: classSubject.teacherId,
              gradedAt: randomDate(gradeItem.date, new Date()),
            },
          })
        }
      }
    }
  }

  console.log('🎯 Created grade items and grades')

  // 16. Create Attendance Sessions and Records
  for (const classSubject of classSubjects) {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: classSubject.classId },
    })
    
    // Create attendance sessions for the past 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue
      
      // 80% chance of having class on any given day
      if (Math.random() < 0.8) {
        const session = await prisma.attendanceSession.create({
          data: {
            date: new Date(d),
            notes: faker.helpers.arrayElement([
              'Regular class session',
              'Quiz day',
              'Group work',
              'Presentation day',
              null
            ]),
            classSubjectId: classSubject.id,
            createdById: classSubject.teacherId,
          },
        })
        
        // Create attendance records for each student
        for (const enrollment of enrollments) {
          const attendanceStatus = faker.helpers.weightedArrayElement([
            { weight: 0.85, value: 'PRESENT' },
            { weight: 0.08, value: 'ABSENT' },
            { weight: 0.05, value: 'LATE' },
            { weight: 0.02, value: 'EXCUSED' },
          ])
          
          await prisma.attendance.create({
            data: {
              status: attendanceStatus,
              notes: attendanceStatus === 'ABSENT' ? faker.helpers.arrayElement([
                'Sick',
                'Family emergency',
                'Medical appointment',
                null
              ]) : null,
              sessionId: session.id,
              studentId: enrollment.studentId,
            },
          })
        }
      }
    }
  }

  console.log('✅ Created attendance sessions and records')

  // 17. Create Student Accounts and Financial Records
  for (const student of students) {
    const studentAccount = await prisma.studentAccount.create({
      data: {
        studentId: student.id,
        balance: faker.number.float({ min: -500, max: 1000, fractionDigits: 2 }),
      },
    })
    
    // Create 2-4 invoices per student
    const invoiceCount = faker.number.int({ min: 2, max: 4 })
    for (let i = 0; i < invoiceCount; i++) {
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${student.studentProfile?.studentIdNumber}-${String(i + 1).padStart(2, '0')}`,
          status: faker.helpers.weightedArrayElement([
            { weight: 0.6, value: 'PAID' },
            { weight: 0.25, value: 'PENDING' },
            { weight: 0.1, value: 'OVERDUE' },
            { weight: 0.05, value: 'CANCELLED' },
          ]),
          dueDate: randomDate(new Date('2024-09-01'), new Date('2024-12-31')),
          total: 0, // Will be calculated from items
          notes: faker.helpers.arrayElement([
            'Tuition fee for semester',
            'Lab fee',
            'Library fine',
            'Sports equipment fee',
            null
          ]),
          accountId: studentAccount.id,
        },
      })
      
      // Create invoice items
      const itemCount = faker.number.int({ min: 1, max: 3 })
      let totalAmount = 0
      
      for (let j = 0; j < itemCount; j++) {
        const unitPrice = faker.number.float({ min: 50, max: 500, fractionDigits: 2 })
        const quantity = faker.number.int({ min: 1, max: 2 })
        const itemTotal = unitPrice * quantity
        totalAmount += itemTotal
        
        await prisma.invoiceItem.create({
          data: {
            description: faker.helpers.arrayElement([
              'Tuition Fee',
              'Lab Fee',
              'Library Fee',
              'Sports Fee',
              'Technology Fee',
              'Transportation Fee'
            ]),
            quantity,
            unitPrice,
            total: itemTotal,
            invoiceId: invoice.id,
          },
        })
      }
      
      // Update invoice total
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { total: totalAmount },
      })
      
      // Create payments for paid invoices
      if (invoice.status === 'PAID') {
        await prisma.payment.create({
          data: {
            amount: totalAmount,
            method: faker.helpers.arrayElement(['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE']),
            reference: `PAY-${faker.string.alphanumeric(8).toUpperCase()}`,
            notes: 'Payment received',
            receivedAt: randomDate(new Date('2024-09-01'), new Date()),
            accountId: studentAccount.id,
            processedById: clerk.clerkProfile?.id || null,
          },
        })
      }
    }
  }

  console.log('💰 Created financial records')

  // 18. Create Events
  for (let i = 0; i < 20; i++) {
    const startDate = randomDate(new Date('2024-10-01'), new Date('2025-03-31'))
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 8 }) * 60 * 60 * 1000)
    
    const event = await prisma.event.create({
      data: {
        title: faker.helpers.arrayElement([
          'Parent-Teacher Conference',
          'Science Fair',
          'Sports Day',
          'Cultural Festival',
          'Final Examinations',
          'Winter Break',
          'Graduation Ceremony',
          'Open House',
          'Staff Meeting',
          'School Play'
        ]),
        description: faker.lorem.paragraph(),
        startDate,
        endDate,
        location: faker.helpers.arrayElement([
          'Main Auditorium',
          'Gymnasium',
          'Library',
          'Cafeteria',
          'Outdoor Field',
          'Conference Room'
        ]),
        type: faker.helpers.arrayElement(['HOLIDAY', 'EXAM', 'MEETING', 'SPORTS', 'CULTURAL', 'PARENT_TEACHER', 'OTHER']) as 'HOLIDAY' | 'EXAM' | 'MEETING' | 'SPORTS' | 'CULTURAL' | 'PARENT_TEACHER' | 'OTHER',
        isAllDay: faker.datatype.boolean(0.3),
        schoolId: SCHOOL_ID,
        createdById: principal.id,
      },
    })
    
    // Create event audiences
    await prisma.eventAudience.create({
      data: {
        scope: faker.helpers.arrayElement(['SCHOOL', 'CLASS', 'SUBJECT']),
        eventId: event.id,
        classId: faker.helpers.arrayElement([null, ...classes.map(c => c.id)]),
        subjectId: faker.helpers.arrayElement([null, ...subjects.map(s => s.id)]),
      },
    })
  }

  console.log('🎉 Created events')

  // 19. Create Notifications
  for (const user of users) {
    const notificationCount = faker.number.int({ min: 5, max: 15 })
    
    for (let i = 0; i < notificationCount; i++) {
      await prisma.notification.create({
        data: {
          title: faker.helpers.arrayElement([
            'New Assignment Posted',
            'Grade Updated',
            'Attendance Alert',
            'Fee Payment Due',
            'School Announcement',
            'New Message Received',
            'Event Reminder',
            'System Update'
          ]),
          content: faker.lorem.sentence(),
          type: faker.helpers.arrayElement([
            'ASSIGNMENT',
            'GRADE',
            'ATTENDANCE',
            'FEE',
            'ANNOUNCEMENT',
            'MESSAGE',
            'EVENT',
            'SYSTEM'
          ]),
          isRead: faker.datatype.boolean(0.7),
          data: {
            entityId: faker.string.uuid(),
            entityType: faker.helpers.arrayElement(['assignment', 'grade', 'event', 'message']),
          },
          userId: user.id,
          readAt: faker.datatype.boolean(0.7) ? randomDate(new Date('2024-10-01'), new Date()) : null,
        },
      })
    }
  }

  console.log('🔔 Created notifications')

  // 20. Create Announcements
  for (let i = 0; i < 10; i++) {
    await prisma.announcement.create({
      data: {
        title: faker.helpers.arrayElement([
          'School Closure Notice',
          'New Academic Year Guidelines',
          'Sports Team Tryouts',
          'Parent-Teacher Meeting Schedule',
          'Library Hours Update',
          'Cafeteria Menu Changes',
          'Exam Schedule Released',
          'Holiday Calendar Update'
        ]),
        content: faker.lorem.paragraphs(2),
        scope: faker.helpers.arrayElement(['SCHOOL', 'CLASS', 'SUBJECT']),
        priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
        schoolId: SCHOOL_ID,
        createdById: principal.id,
        publishedAt: randomDate(new Date('2024-09-01'), new Date()),
        expiresAt: randomDate(new Date(), new Date('2025-06-30')),
      },
    })
  }

  console.log('📢 Created announcements')

  // 21. Create Message Attachments
  const messages = await prisma.message.findMany({ take: 50 })
  
  for (const message of messages) {
    // 30% chance of having an attachment
    if (faker.datatype.boolean(0.3)) {
      await prisma.messageAttachment.create({
        data: {
          url: faker.internet.url(),
          filename: faker.system.commonFileName(),
          fileType: faker.helpers.arrayElement(['pdf', 'docx', 'jpg', 'png', 'xlsx']),
          fileSize: faker.number.int({ min: 1000, max: 5000000 }),
          messageId: message.id,
        },
      })
    }
  }

  console.log('📎 Created message attachments')

  // 22. Create Resources
  const resourceTags = []
  const tagNames = ['Math', 'Science', 'English', 'History', 'PE', 'Tutorial', 'Reference', 'Homework', 'Exam Prep']
  
  for (const name of tagNames) {
    const tag = await prisma.resourceTag.create({
      data: { name },
    })
    resourceTags.push(tag)
  }

  const resources = []
  for (let i = 0; i < 50; i++) {
    const owner = faker.helpers.arrayElement(users)
    
    const resource = await prisma.resource.create({
      data: {
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        url: faker.internet.url(),
        type: faker.helpers.arrayElement(['DOCUMENT', 'VIDEO', 'LINK', 'PRESENTATION', 'SPREADSHEET', 'IMAGE', 'OTHER']),
        visibility: faker.helpers.arrayElement(['SCHOOL', 'CLASS', 'SUBJECT', 'PRIVATE']),
        fileSize: faker.number.int({ min: 1000, max: 5000000 }),
        schoolId: SCHOOL_ID,
        ownerId: owner.id,
      },
    })
    resources.push(resource)

    // Add tags to resource
    const tagCount = faker.number.int({ min: 1, max: 3 })
    const selectedTags = faker.helpers.arrayElements(resourceTags, tagCount)
    
    for (const tag of selectedTags) {
      await prisma.resourceTagJoin.create({
        data: {
          resourceId: resource.id,
          tagId: tag.id,
        },
      })
    }

    // Create resource links to class subjects (30% chance)
    if (faker.datatype.boolean(0.3)) {
      const classSubject = faker.helpers.arrayElement(classSubjects)
      
      await prisma.resourceLink.create({
        data: {
          resourceId: resource.id,
          classSubjectId: classSubject.id,
          termId: faker.helpers.arrayElement([null, terms[0].id]),
        },
      })
    }
  }

  console.log('📚 Created resources and tags')

  // 23. Create Event Attendees
  const events = await prisma.event.findMany({ take: 20 })
  
  for (const event of events) {
    const attendeeCount = faker.number.int({ min: 5, max: 20 })
    const selectedUsers = faker.helpers.arrayElements(users, attendeeCount)
    
    for (const user of selectedUsers) {
      await prisma.eventAttendee.create({
        data: {
          rsvpStatus: faker.helpers.arrayElement(['CONFIRMED', 'TENTATIVE', 'DECLINED']),
          eventId: event.id,
          userId: user.id,
        },
      })
    }
  }

  console.log('🎟️ Created event attendees')

  // 24. Create Lesson Plans
  const lessonPlans = []
  for (const classSubject of classSubjects) {
    const lessonPlanCount = faker.number.int({ min: 5, max: 10 })
    
    for (let i = 0; i < lessonPlanCount; i++) {
      const lessonPlan = await prisma.lessonPlan.create({
        data: {
          title: faker.lorem.words(3),
          date: randomDate(new Date('2024-09-01'), new Date('2024-12-15')),
          objectives: faker.lorem.paragraph(),
          materials: faker.lorem.words(5),
          activities: faker.lorem.paragraphs(2),
          homework: faker.lorem.sentence(),
          notes: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(['DRAFT', 'PUBLISHED', 'COMPLETED']),
          classSubjectId: classSubject.id,
          teacherId: classSubject.teacherId,
        },
      })
      lessonPlans.push(lessonPlan)

      // Create attachments for 30% of lesson plans
      if (faker.datatype.boolean(0.3)) {
        const attachmentCount = faker.number.int({ min: 1, max: 3 })
        
        for (let j = 0; j < attachmentCount; j++) {
          await prisma.lessonPlanAttachment.create({
            data: {
              url: faker.internet.url(),
              filename: faker.system.commonFileName(),
              fileType: faker.helpers.arrayElement(['pdf', 'docx', 'pptx', 'xlsx']),
              lessonPlanId: lessonPlan.id,
            },
          })
        }
      }
    }
  }

  console.log('📝 Created lesson plans')

  // 25. Create Audit Logs
  for (let i = 0; i < 100; i++) {
    const actor = faker.helpers.arrayElement(users)
    
    await prisma.auditLog.create({
      data: {
        entity: faker.helpers.arrayElement(['User', 'Class', 'Assignment', 'Grade', 'Resource', 'Event']),
        entityId: faker.string.uuid(),
        action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE']),
        changes: { field: faker.lorem.word(), oldValue: faker.lorem.word(), newValue: faker.lorem.word() },
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        actorId: actor.id,
      },
    })
  }

  console.log('📝 Created audit logs')

  console.log('✅ Extended database seeding completed successfully!')
}

seedAdditionalData()
  .catch((e) => {
    console.error('❌ Error during extended seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
