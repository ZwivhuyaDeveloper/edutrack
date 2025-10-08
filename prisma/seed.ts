import { PrismaClient, AttendanceStatus, EventType, ResourceType } from '@prisma/client'

const prisma = new PrismaClient()

interface DatabaseContext {
  school: {
    id: string
    name: string
    users: any[]
    classes: any[]
    subjects: any[]
    terms: any[]
  }
  users: any[]
  classes: any[]
  subjects: any[]
  terms: any[]
  teachers: any[]
  students: any[]
  parents: any[]
}

// Fetch existing database context
async function fetchDatabaseContext(): Promise<DatabaseContext> {
  console.log('🔍 Analyzing existing database...')
  
  const school = await prisma.school.findFirst({
    include: {
      users: {
        include: {
          teacherProfile: true,
          studentProfile: true,
          parentProfile: true,
          principalProfile: true,
          clerkProfile: true
        }
      },
      classes: true,
      subjects: true,
      terms: true
    }
  })

  if (!school) {
    throw new Error('No school found in database. Please ensure a school exists before seeding.')
  }

  const users = school.users
  const teachers = users.filter(u => u.role === 'TEACHER')
  const students = users.filter(u => u.role === 'STUDENT')
  const parents = users.filter(u => u.role === 'PARENT')

  console.log(`📊 Found existing data:`)
  console.log(`   School: ${school.name}`)
  console.log(`   Users: ${users.length} (${teachers.length} teachers, ${students.length} students, ${parents.length} parents)`)
  console.log(`   Classes: ${school.classes.length}`)
  console.log(`   Subjects: ${school.subjects.length}`)
  console.log(`   Terms: ${school.terms.length}`)

  return {
    school,
    users,
    classes: school.classes,
    subjects: school.subjects,
    terms: school.terms,
    teachers,
    students,
    parents
  }
}

// Generate realistic names and data
const firstNames = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle']
}

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

const subjects = [
  { name: 'Mathematics', code: 'MATH', description: 'Core mathematics curriculum' },
  { name: 'English Language Arts', code: 'ELA', description: 'Reading, writing, and literature' },
  { name: 'Science', code: 'SCI', description: 'General science curriculum' },
  { name: 'Social Studies', code: 'SS', description: 'History and social sciences' },
  { name: 'Physical Education', code: 'PE', description: 'Physical fitness and sports' },
  { name: 'Art', code: 'ART', description: 'Visual arts and creativity' },
  { name: 'Music', code: 'MUS', description: 'Music theory and performance' },
  { name: 'Computer Science', code: 'CS', description: 'Programming and technology' },
  { name: 'Foreign Language', code: 'FL', description: 'World languages' },
  { name: 'Health', code: 'HLTH', description: 'Health and wellness education' }
]

const departments = ['Mathematics', 'English', 'Science', 'Social Studies', 'Physical Education', 'Arts', 'Technology', 'Special Education']

function getRandomName(gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female') {
  const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return { firstName, lastName }
}

function generateEmail(firstName: string, lastName: string, role: string, schoolDomain: string = 'edutrack.edu') {
  const rolePrefix = role === 'STUDENT' ? 'student.' : role === 'PARENT' ? 'parent.' : ''
  return `${rolePrefix}${firstName.toLowerCase()}.${lastName.toLowerCase()}@${schoolDomain}`
}

async function main() {
  console.log('🌱 Starting contextual database seed...\n')

  try {
    // Fetch existing database context
    const context = await fetchDatabaseContext()
    
    // ============================================
    // 1. ENSURE BASIC SUBJECTS EXIST
    // ============================================
    console.log('\n📚 Ensuring core subjects exist...')
    const existingSubjectCodes = context.subjects.map(s => s.code)
    const missingSubjects = subjects.filter(s => !existingSubjectCodes.includes(s.code))
    
    if (missingSubjects.length > 0) {
      const newSubjects = await Promise.all(
        missingSubjects.map(subject =>
          prisma.subject.create({
            data: {
              name: subject.name,
              code: subject.code,
              description: subject.description,
              schoolId: context.school.id
            }
          })
        )
      )
      context.subjects.push(...newSubjects)
      console.log(`✅ Created ${newSubjects.length} new subjects`)
    } else {
      console.log('✅ All core subjects already exist')
    }

    // ============================================
    // 2. ENSURE ACTIVE TERM EXISTS
    // ============================================
    console.log('\n📅 Ensuring active term exists...')
    let activeTerm = context.terms.find(t => t.isActive)
    
    if (!activeTerm) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      const termName = currentMonth >= 8 || currentMonth <= 1 ? `Fall ${currentYear}` : `Spring ${currentYear}`
      const startDate = currentMonth >= 8 || currentMonth <= 1 ? 
        new Date(currentYear, 8, 1) : new Date(currentYear, 1, 1)
      const endDate = currentMonth >= 8 || currentMonth <= 1 ? 
        new Date(currentYear, 11, 20) : new Date(currentYear, 5, 15)

      activeTerm = await prisma.term.create({
        data: {
          name: termName,
          startDate,
          endDate,
          isActive: true,
          schoolId: context.school.id
        }
      })
      console.log(`✅ Created active term: ${activeTerm.name}`)
    } else {
      console.log(`✅ Active term exists: ${activeTerm.name}`)
    }

    // ============================================
    // 3. CREATE ADDITIONAL TEACHERS IF NEEDED
    // ============================================
    console.log('\n👨‍🏫 Ensuring adequate teacher coverage...')
    const targetTeacherCount = Math.max(6, Math.ceil(context.subjects.length * 0.8))
    const teachersNeeded = Math.max(0, targetTeacherCount - context.teachers.length)
    
    if (teachersNeeded > 0) {
      const newTeachers = []
      for (let i = 0; i < teachersNeeded; i++) {
        const { firstName, lastName } = getRandomName()
        const department = departments[Math.floor(Math.random() * departments.length)]
        const hireYear = 2018 + Math.floor(Math.random() * 6)
        
        const teacher = await prisma.user.create({
          data: {
            clerkId: `clerk_teacher_${Date.now()}_${i}`,
            email: generateEmail(firstName, lastName, 'TEACHER'),
            firstName,
            lastName,
            role: 'TEACHER',
            schoolId: context.school.id,
            isActive: true,
            teacherProfile: {
              create: {
                employeeId: `EMP${String(1000 + context.teachers.length + i + 1).padStart(4, '0')}`,
                department,
                hireDate: new Date(hireYear, Math.floor(Math.random() * 12), 1),
                qualifications: `${Math.random() > 0.5 ? 'MSc' : 'BSc'} in ${department}`,
              }
            }
          },
          include: { teacherProfile: true }
        })
        
        newTeachers.push(teacher)
        context.teachers.push(teacher)
      }
      console.log(`✅ Created ${newTeachers.length} additional teachers`)
    } else {
      console.log('✅ Sufficient teachers already exist')
    }

    // ============================================
    // 4. CREATE ADDITIONAL STUDENTS IF NEEDED
    // ============================================
    console.log('\n👨‍🎓 Ensuring adequate student population...')
    const targetStudentCount = Math.max(20, context.classes.length * 25)
    const studentsNeeded = Math.max(0, targetStudentCount - context.students.length)
    
    if (studentsNeeded > 0) {
      const grades = ['9', '10', '11', '12']
      const newStudents = []
      
      for (let i = 0; i < studentsNeeded; i++) {
        const { firstName, lastName } = getRandomName()
        const grade = grades[Math.floor(Math.random() * grades.length)]
        const birthYear = new Date().getFullYear() - (14 + parseInt(grade) - 9)
        
        const student = await prisma.user.create({
          data: {
            clerkId: `clerk_student_${Date.now()}_${i}`,
            email: generateEmail(firstName, lastName, 'STUDENT'),
            firstName,
            lastName,
            role: 'STUDENT',
            schoolId: context.school.id,
            isActive: true,
            studentProfile: {
              create: {
                dateOfBirth: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                grade,
                studentIdNumber: `STU${String(1000 + context.students.length + i + 1).padStart(4, '0')}`,
                emergencyContact: `Emergency Contact: +1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Maple'][Math.floor(Math.random() * 5)]} Street`,
              }
            }
          },
          include: { studentProfile: true }
        })
        
        newStudents.push(student)
        context.students.push(student)
      }
      console.log(`✅ Created ${newStudents.length} additional students`)
    } else {
      console.log('✅ Sufficient students already exist')
    }

    // ============================================
    // 5. CREATE CLASSES IF NEEDED
    // ============================================
    console.log('\n🏫 Creating classes...')
    if (context.classes.length === 0) {
      const grades = ['9', '10', '11', '12']
      const sections = ['A', 'B', 'C']
      const newClasses = []
      
      for (const grade of grades) {
        // Create 1-2 sections per grade
        const sectionsForGrade = sections.slice(0, 1 + Math.floor(Math.random() * 2))
        
        for (const section of sectionsForGrade) {
          const newClass = await prisma.class.create({
            data: {
              name: `Grade ${grade}${section}`,
              grade,
              section,
              schoolId: context.school.id
            }
          })
          newClasses.push(newClass)
          context.classes.push(newClass)
        }
      }
      console.log(`✅ Created ${newClasses.length} classes`)
    } else {
      console.log('✅ Classes already exist')
    }

    // ============================================
    // 6. CREATE ROOMS AND PERIODS
    // ============================================
    console.log('\n🏢 Creating rooms and periods...')
    const existingRooms = await prisma.room.findMany({
      where: { schoolId: context.school.id }
    })
    
    const roomsNeeded = Math.max(0, 8 - existingRooms.length)
    const newRooms = []
    
    if (roomsNeeded > 0) {
      const roomTypes = [
        { name: 'Classroom', building: 'Main Building', facilities: ['Projector', 'Whiteboard', 'Computer'] },
        { name: 'Lab', building: 'Science Wing', facilities: ['Lab Equipment', 'Safety Gear', 'Projector'] },
        { name: 'Computer Lab', building: 'Technology Center', facilities: ['Computers', 'Projector', 'Network'] },
        { name: 'Library', building: 'Main Building', facilities: ['Books', 'Study Tables', 'Computers'] },
        { name: 'Gymnasium', building: 'Sports Complex', facilities: ['Sports Equipment', 'Sound System'] },
        { name: 'Art Room', building: 'Arts Wing', facilities: ['Art Supplies', 'Easels', 'Sink'] },
        { name: 'Music Room', building: 'Arts Wing', facilities: ['Instruments', 'Sound System', 'Piano'] },
        { name: 'Auditorium', building: 'Main Building', facilities: ['Stage', 'Sound System', 'Lighting'] }
      ]
      
      for (let i = 0; i < roomsNeeded && i < roomTypes.length; i++) {
        const roomType = roomTypes[i]
        const room = await prisma.room.create({
          data: {
            name: `${roomType.name} ${100 + i + existingRooms.length}`,
            building: roomType.building,
            capacity: 25 + Math.floor(Math.random() * 15),
            floor: String(1 + Math.floor(Math.random() * 3)),
            facilities: roomType.facilities,
            schoolId: context.school.id
          }
        })
        newRooms.push(room)
      }
      console.log(`✅ Created ${newRooms.length} rooms`)
    } else {
      console.log('✅ Sufficient rooms already exist')
    }

    const existingPeriods = await prisma.period.findMany({
      where: { schoolId: context.school.id }
    })
    
    const periodsNeeded = Math.max(0, 8 - existingPeriods.length)
    const newPeriods = []
    
    if (periodsNeeded > 0) {
      const periodTimes = [
        { name: 'Period 1', start: '08:00', end: '08:50' },
        { name: 'Period 2', start: '09:00', end: '09:50' },
        { name: 'Period 3', start: '10:00', end: '10:50' },
        { name: 'Period 4', start: '11:00', end: '11:50' },
        { name: 'Lunch', start: '12:00', end: '12:30' },
        { name: 'Period 5', start: '12:40', end: '13:30' },
        { name: 'Period 6', start: '13:40', end: '14:30' },
        { name: 'Period 7', start: '14:40', end: '15:30' }
      ]
      
      for (let i = 0; i < periodsNeeded && i < periodTimes.length; i++) {
        const periodTime = periodTimes[i]
        const period = await prisma.period.create({
          data: {
            name: periodTime.name,
            startTime: periodTime.start,
            endTime: periodTime.end,
            order: i + existingPeriods.length + 1,
            schoolId: context.school.id
          }
        })
        newPeriods.push(period)
      }
      console.log(`✅ Created ${newPeriods.length} periods`)
    } else {
      console.log('✅ Sufficient periods already exist')
    }

    // ============================================
    // 7. CREATE CLASS-SUBJECT ASSIGNMENTS
    // ============================================
    console.log('\n🔗 Creating class-subject assignments...')
    const existingClassSubjects = await prisma.classSubject.findMany({
      where: { class: { schoolId: context.school.id } }
    })
    
    let classSubjectsCreated = 0
    for (const classItem of context.classes) {
      // Assign 4-6 subjects per class
      const subjectsPerClass = 4 + Math.floor(Math.random() * 3)
      const shuffledSubjects = [...context.subjects].sort(() => Math.random() - 0.5)
      const classSubjects = shuffledSubjects.slice(0, subjectsPerClass)
      
      for (const subject of classSubjects) {
        const exists = existingClassSubjects.some(cs => 
          cs.classId === classItem.id && cs.subjectId === subject.id
        )
        
        if (!exists) {
          const teacher = context.teachers[Math.floor(Math.random() * context.teachers.length)]
          
          await prisma.classSubject.create({
            data: {
              classId: classItem.id,
              subjectId: subject.id,
              teacherId: teacher.id
            }
          })
          classSubjectsCreated++
        }
      }
    }
    console.log(`✅ Created ${classSubjectsCreated} class-subject assignments`)

    // ============================================
    // 6. CREATE STUDENT ENROLLMENTS
    // ============================================
    console.log('\n📝 Creating student enrollments...')
    const existingEnrollments = await prisma.enrollment.findMany({
      where: { class: { schoolId: context.school.id } }
    })
    
    let enrollmentsCreated = 0
    for (const student of context.students) {
      const studentGrade = student.studentProfile?.grade
      if (!studentGrade) continue
      
      // Find classes for this grade
      const gradeClasses = context.classes.filter(c => c.grade === studentGrade)
      if (gradeClasses.length === 0) continue
      
      // Enroll in one class per grade
      const targetClass = gradeClasses[Math.floor(Math.random() * gradeClasses.length)]
      const alreadyEnrolled = existingEnrollments.some(e => 
        e.studentId === student.id && e.classId === targetClass.id
      )
      
      if (!alreadyEnrolled) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: targetClass.id,
            status: 'ACTIVE'
          }
        })
        enrollmentsCreated++
      }
    }
    console.log(`✅ Created ${enrollmentsCreated} student enrollments`)

    // ============================================
    // 7. CREATE ASSIGNMENTS
    // ============================================
    console.log('\n📚 Creating assignments...')
    const classSubjects = await prisma.classSubject.findMany({
      where: { class: { schoolId: context.school.id } },
      include: { class: true, subject: true }
    })
    
    const assignmentTypes = [
      'Homework Assignment',
      'Quiz',
      'Test',
      'Project',
      'Lab Report',
      'Essay',
      'Presentation',
      'Research Paper'
    ]
    
    let assignmentsCreated = 0
    for (const classSubject of classSubjects.slice(0, 10)) { // Limit to prevent too many
      const assignmentCount = 2 + Math.floor(Math.random() * 3) // 2-4 assignments per class-subject
      
      for (let i = 0; i < assignmentCount; i++) {
        const assignmentType = assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)]
        const daysFromNow = Math.floor(Math.random() * 30) + 1
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + daysFromNow)
        
        await prisma.assignment.create({
          data: {
            title: `${classSubject.subject.name} ${assignmentType} ${i + 1}`,
            description: `Complete the ${assignmentType.toLowerCase()} for ${classSubject.subject.name}`,
            dueDate,
            maxPoints: 100,
            classId: classSubject.classId,
            subjectId: classSubject.subjectId,
            termId: activeTerm.id
          }
        })
        assignmentsCreated++
      }
    }
    console.log(`✅ Created ${assignmentsCreated} assignments`)

    // ============================================
    // 8. CREATE LESSON PLANS
    // ============================================
    console.log('\n📝 Creating lesson plans...')
    let lessonPlansCreated = 0
    
    for (const classSubject of classSubjects.slice(0, 8)) { // Limit to prevent too many
      const lessonCount = 3 + Math.floor(Math.random() * 3) // 3-5 lessons per class-subject
      
      for (let i = 0; i < lessonCount; i++) {
        const lessonDate = new Date()
        lessonDate.setDate(lessonDate.getDate() + (i * 7)) // Weekly lessons
        
        await prisma.lessonPlan.create({
          data: {
            title: `${classSubject.subject.name} Lesson ${i + 1}`,
            date: lessonDate,
            objectives: `Students will understand key concepts in ${classSubject.subject.name}`,
            materials: 'Textbook, whiteboard, handouts',
            activities: 'Lecture, discussion, practice exercises',
            homework: `Complete exercises from ${classSubject.subject.name} workbook`,
            status: Math.random() > 0.3 ? 'PUBLISHED' : 'DRAFT',
            classSubjectId: classSubject.id,
            teacherId: classSubject.teacherId
          }
        })
        lessonPlansCreated++
      }
    }
    console.log(`✅ Created ${lessonPlansCreated} lesson plans`)

    // ============================================
    // 9. CREATE ATTENDANCE SESSIONS
    // ============================================
    console.log('\n✅ Creating attendance sessions...')
    let attendanceSessionsCreated = 0
    
    for (const classSubject of classSubjects.slice(0, 5)) {
      const sessionCount = 5 + Math.floor(Math.random() * 5) // 5-9 sessions
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionDate = new Date()
        sessionDate.setDate(sessionDate.getDate() - (sessionCount - i))
        
        const session = await prisma.attendanceSession.create({
          data: {
            date: sessionDate,
            notes: `Regular class session for ${classSubject.subject.name}`,
            classSubjectId: classSubject.id,
            createdById: classSubject.teacherId
          }
        })
        
        // Create attendance records for enrolled students
        const enrolledStudents = await prisma.enrollment.findMany({
          where: { classId: classSubject.classId, status: 'ACTIVE' },
          include: { student: true }
        })
        
        for (const enrollment of enrolledStudents) {
          const statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
          const weights = [0.85, 0.08, 0.05, 0.02] // 85% present, 8% absent, 5% late, 2% excused
          
          let status: AttendanceStatus = 'PRESENT'
          const rand = Math.random()
          let cumulative = 0
          for (let j = 0; j < weights.length; j++) {
            cumulative += weights[j]
            if (rand <= cumulative) {
              status = statuses[j]
              break
            }
          }
          
          await prisma.attendance.create({
            data: {
              sessionId: session.id,
              studentId: enrollment.studentId,
              status,
              notes: status !== 'PRESENT' ? `Student was ${status.toLowerCase()}` : null
            }
          })
        }
        
        attendanceSessionsCreated++
      }
    }
    console.log(`✅ Created ${attendanceSessionsCreated} attendance sessions with records`)

    // ============================================
    // 10. CREATE RESOURCES
    // ============================================
    console.log('\n📁 Creating educational resources...')
    const resourceTypes: ResourceType[] = ['DOCUMENT', 'VIDEO', 'LINK', 'PRESENTATION', 'IMAGE']
    let resourcesCreated = 0
    
    for (const subject of context.subjects.slice(0, 6)) {
      const resourceCount = 2 + Math.floor(Math.random() * 3) // 2-4 resources per subject
      
      for (let i = 0; i < resourceCount; i++) {
        const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)]
        const teacher = context.teachers[Math.floor(Math.random() * context.teachers.length)]
        
        await prisma.resource.create({
          data: {
            title: `${subject.name} Study Guide ${i + 1}`,
            description: `Educational resource for ${subject.name}`,
            url: `https://example.com/${subject.code.toLowerCase()}-resource-${i + 1}`,
            type: resourceType,
            visibility: Math.random() > 0.5 ? 'CLASS' : 'SUBJECT',
            schoolId: context.school.id,
            ownerId: teacher.id
          }
        })
        resourcesCreated++
      }
    }
    console.log(`✅ Created ${resourcesCreated} educational resources`)

    // ============================================
    // 11. CREATE SCHOOL EVENTS
    // ============================================
    console.log('\n🎉 Creating school events...')
    const eventTypes: EventType[] = ['MEETING', 'EXAM', 'SPORTS', 'CULTURAL', 'PARENT_TEACHER', 'HOLIDAY']
    const eventNames = [
      'Parent-Teacher Conference',
      'Science Fair',
      'Sports Day',
      'Art Exhibition',
      'Music Concert',
      'Graduation Ceremony',
      'Open House',
      'Academic Awards',
      'Winter Break',
      'Spring Festival'
    ]
    
    let eventsCreated = 0
    for (let i = 0; i < 8; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const eventName = eventNames[Math.floor(Math.random() * eventNames.length)]
      const daysFromNow = Math.floor(Math.random() * 60) + 1
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + daysFromNow)
      const endDate = new Date(startDate)
      endDate.setHours(endDate.getHours() + 2 + Math.floor(Math.random() * 4))
      
      const principal = context.users.find(u => u.role === 'PRINCIPAL') || context.teachers[0]
      
      await prisma.event.create({
        data: {
          title: eventName,
          description: `School-wide ${eventName.toLowerCase()} event`,
          startDate,
          endDate,
          location: 'School Campus',
          type: eventType,
          isAllDay: Math.random() > 0.7,
          schoolId: context.school.id,
          createdById: principal.id
        }
      })
      eventsCreated++
    }
    console.log(`✅ Created ${eventsCreated} school events`)

    // ============================================
    // 12. CREATE ANNOUNCEMENTS
    // ============================================
    console.log('\n📢 Creating announcements...')
    const announcementTitles = [
      'Welcome Back to School',
      'Important Schedule Changes',
      'Parent-Teacher Conference Reminder',
      'School Safety Guidelines',
      'Academic Achievement Recognition',
      'Upcoming Holiday Schedule',
      'New Library Resources Available',
      'Sports Team Tryouts',
      'Art Contest Submission Deadline',
      'Technology Policy Update'
    ]
    
    let announcementsCreated = 0
    const principal = context.users.find(u => u.role === 'PRINCIPAL') || context.teachers[0]
    
    for (let i = 0; i < 6; i++) {
      const title = announcementTitles[Math.floor(Math.random() * announcementTitles.length)]
      const daysAgo = Math.floor(Math.random() * 14)
      const publishedAt = new Date()
      publishedAt.setDate(publishedAt.getDate() - daysAgo)
      
      await prisma.announcement.create({
        data: {
          title,
          content: `This is an important announcement regarding ${title.toLowerCase()}. Please read carefully and contact the office if you have any questions.`,
          scope: 'SCHOOL',
          priority: Math.random() > 0.8 ? 'high' : 'normal',
          schoolId: context.school.id,
          createdById: principal.id,
          publishedAt
        }
      })
      announcementsCreated++
    }
    console.log(`✅ Created ${announcementsCreated} announcements`)

    // ============================================
    // 13. CREATE PARENT-CHILD RELATIONSHIPS
    // ============================================
    console.log('\n👨‍👩‍👧‍👦 Creating parent-child relationships...')
    const existingRelationships = await prisma.parentChildRelationship.findMany({
      where: {
        OR: [
          { parent: { schoolId: context.school.id } },
          { child: { schoolId: context.school.id } }
        ]
      }
    })
    
    let relationshipsCreated = 0
    const availableParents = context.parents
    const availableStudents = context.students.filter(student => 
      !existingRelationships.some(rel => rel.childId === student.id)
    )
    
    // Create parent-child relationships for students without parents
    for (let i = 0; i < Math.min(availableParents.length, availableStudents.length); i++) {
      const parent = availableParents[i]
      const student = availableStudents[i]
      
      await prisma.parentChildRelationship.create({
        data: {
          parentId: parent.id,
          childId: student.id,
          relationship: 'PARENT'
        }
      })
      relationshipsCreated++
    }
    
    // Create additional parents if needed
    if (availableStudents.length > availableParents.length) {
      const parentsNeeded = Math.min(5, availableStudents.length - availableParents.length)
      
      for (let i = 0; i < parentsNeeded; i++) {
        const { firstName, lastName } = getRandomName()
        const student = availableStudents[availableParents.length + i]
        
        const parent = await prisma.user.create({
          data: {
            clerkId: `clerk_parent_${Date.now()}_${i}`,
            email: generateEmail(firstName, lastName, 'PARENT'),
            firstName,
            lastName,
            role: 'PARENT',
            schoolId: context.school.id,
            isActive: true,
            parentProfile: {
              create: {
                phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                address: `${Math.floor(Math.random() * 9999) + 1} ${['Oak', 'Pine', 'Elm', 'Maple', 'Cedar'][Math.floor(Math.random() * 5)]} Street`,
                emergencyContact: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
              }
            }
          }
        })
        
        await prisma.parentChildRelationship.create({
          data: {
            parentId: parent.id,
            childId: student.id,
            relationship: 'PARENT'
          }
        })
        
        context.parents.push(parent)
        relationshipsCreated++
      }
    }
    console.log(`✅ Created ${relationshipsCreated} parent-child relationships`)

    // ============================================
    // 14. CREATE CLASS MEETINGS (SCHEDULES)
    // ============================================
    console.log('\n🗓️ Creating class schedules...')
    const allRooms = await prisma.room.findMany({
      where: { schoolId: context.school.id }
    })
    const allPeriods = await prisma.period.findMany({
      where: { schoolId: context.school.id },
      orderBy: { order: 'asc' }
    })
    
    const allClassSubjects = await prisma.classSubject.findMany({
      where: { class: { schoolId: context.school.id } }
    })
    
    let classMeetingsCreated = 0
    const daysOfWeek = [1, 2, 3, 4, 5] // Monday to Friday
    
    for (const classSubject of allClassSubjects) {
      // Schedule each class-subject 2-3 times per week
      const meetingsPerWeek = 2 + Math.floor(Math.random() * 2)
      const selectedDays = daysOfWeek.sort(() => Math.random() - 0.5).slice(0, meetingsPerWeek)
      
      for (const day of selectedDays) {
        const period = allPeriods[Math.floor(Math.random() * allPeriods.length)]
        const room = allRooms[Math.floor(Math.random() * allRooms.length)]
        
        // Check if this time slot is already taken
        const existingMeeting = await prisma.classMeeting.findFirst({
          where: {
            dayOfWeek: day,
            periodId: period.id,
            roomId: room.id
          }
        })
        
        if (!existingMeeting) {
          await prisma.classMeeting.create({
            data: {
              dayOfWeek: day,
              classSubjectId: classSubject.id,
              periodId: period.id,
              roomId: room.id
            }
          })
          classMeetingsCreated++
        }
      }
    }
    console.log(`✅ Created ${classMeetingsCreated} class meetings`)

    // ============================================
    // 15. CREATE ASSIGNMENT SUBMISSIONS
    // ============================================
    console.log('\n✍️ Creating assignment submissions...')
    const allAssignments = await prisma.assignment.findMany({
      where: { class: { schoolId: context.school.id } },
      include: { class: { include: { enrollments: true } } }
    })
    
    let submissionsCreated = 0
    for (const assignment of allAssignments) {
      const enrolledStudents = assignment.class.enrollments
      
      // 60-90% of students submit assignments
      const submissionRate = 0.6 + Math.random() * 0.3
      const studentsToSubmit = Math.floor(enrolledStudents.length * submissionRate)
      const selectedStudents = enrolledStudents.sort(() => Math.random() - 0.5).slice(0, studentsToSubmit)
      
      for (const enrollment of selectedStudents) {
        const submissionDate = new Date(assignment.dueDate)
        submissionDate.setDate(submissionDate.getDate() - Math.floor(Math.random() * 7)) // Submit 0-7 days before due date
        
        const submissionContent = [
          'Completed assignment as requested',
          'Please find my work attached',
          'Assignment completed with research and analysis',
          'Submitted on time with all requirements met',
          'Work completed according to instructions'
        ]
        
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: assignment.id,
            studentId: enrollment.studentId,
            content: submissionContent[Math.floor(Math.random() * submissionContent.length)],
            attachments: [`assignment_${assignment.id}_${enrollment.studentId}.pdf`],
            submittedAt: submissionDate
          }
        })
        submissionsCreated++
      }
    }
    console.log(`✅ Created ${submissionsCreated} assignment submissions`)

    // ============================================
    // 16. CREATE GRADES AND GRADE ITEMS
    // ============================================
    console.log('\n📊 Creating grades and grade items...')
    let gradeItemsCreated = 0
    let gradesCreated = 0
    
    for (const classSubject of allClassSubjects.slice(0, 10)) { // Limit to prevent too many
      // Create grade categories
      const categories = [
        { name: 'Homework', weight: 30, description: 'Regular homework assignments' },
        { name: 'Quizzes', weight: 25, description: 'Weekly quizzes and tests' },
        { name: 'Projects', weight: 25, description: 'Major projects and presentations' },
        { name: 'Participation', weight: 20, description: 'Class participation and engagement' }
      ]
      
      for (const categoryData of categories) {
        const category = await prisma.gradeCategory.create({
          data: {
            name: categoryData.name,
            weight: categoryData.weight,
            description: categoryData.description,
            classSubjectId: classSubject.id
          }
        })
        
        // Create 2-4 grade items per category
        const itemsCount = 2 + Math.floor(Math.random() * 3)
        for (let i = 0; i < itemsCount; i++) {
          const gradeItem = await prisma.gradeItem.create({
            data: {
              name: `${categoryData.name} ${i + 1}`,
              description: `${categoryData.name} assignment ${i + 1}`,
              maxPoints: categoryData.name === 'Participation' ? 10 : 100,
              date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
              classSubjectId: classSubject.id,
              categoryId: category.id
            }
          })
          gradeItemsCreated++
          
          // Create grades for enrolled students
          const enrollments = await prisma.enrollment.findMany({
            where: { classId: classSubject.classId, status: 'ACTIVE' }
          })
          
          for (const enrollment of enrollments) {
            // 80% chance of having a grade
            if (Math.random() < 0.8) {
              const maxPoints = gradeItem.maxPoints
              const points = Math.floor(maxPoints * (0.6 + Math.random() * 0.4)) // 60-100% scores
              
              await prisma.grade.create({
                data: {
                  points,
                  feedback: points >= maxPoints * 0.9 ? 'Excellent work!' : 
                           points >= maxPoints * 0.8 ? 'Good job!' : 
                           points >= maxPoints * 0.7 ? 'Satisfactory' : 'Needs improvement',
                  gradeItemId: gradeItem.id,
                  studentId: enrollment.studentId,
                  teacherId: classSubject.teacherId
                }
              })
              gradesCreated++
            }
          }
        }
      }
    }
    console.log(`✅ Created ${gradeItemsCreated} grade items and ${gradesCreated} grades`)

    // ============================================
    // 17. CREATE CONVERSATIONS AND MESSAGES
    // ============================================
    console.log('\n💬 Creating conversations and messages...')
    let conversationsCreated = 0
    let messagesCreated = 0
    
    // Create teacher-parent conversations
    const teacherParentPairs = []
    for (const teacher of context.teachers.slice(0, 5)) {
      for (const parent of context.parents.slice(0, 3)) {
        teacherParentPairs.push({ teacher, parent })
      }
    }
    
    for (const pair of teacherParentPairs.slice(0, 8)) { // Limit conversations
      const conversation = await prisma.conversation.create({
        data: {
          title: `Discussion about student progress`,
          isGroup: false,
          schoolId: context.school.id
        }
      })
      
      await prisma.conversationParticipant.createMany({
        data: [
          { conversationId: conversation.id, userId: pair.teacher.id },
          { conversationId: conversation.id, userId: pair.parent.id }
        ]
      })
      
      // Create 2-5 messages per conversation
      const messageCount = 2 + Math.floor(Math.random() * 4)
      const messageTemplates = [
        "Hello, I wanted to discuss your child's progress in class.",
        "Thank you for reaching out. I appreciate your concern.",
        "The student has been doing well with homework assignments.",
        "I've noticed some improvement in class participation.",
        "Please let me know if you have any questions.",
        "I'll make sure to provide extra support as needed.",
        "Thank you for your time and attention to this matter."
      ]
      
      for (let i = 0; i < messageCount; i++) {
        const sender = i % 2 === 0 ? pair.teacher : pair.parent
        const messageContent = messageTemplates[Math.floor(Math.random() * messageTemplates.length)]
        
        await prisma.message.create({
          data: {
            content: messageContent,
            status: 'SENT',
            conversationId: conversation.id,
            senderId: sender.id,
            sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
          }
        })
        messagesCreated++
      }
      conversationsCreated++
    }
    console.log(`✅ Created ${conversationsCreated} conversations and ${messagesCreated} messages`)

    // ============================================
    // 18. CREATE NOTIFICATIONS
    // ============================================
    console.log('\n🔔 Creating notifications...')
    let notificationsCreated = 0
    
    const notificationTypes = ['ASSIGNMENT', 'GRADE', 'ATTENDANCE', 'ANNOUNCEMENT', 'MESSAGE', 'EVENT']
    const notificationTemplates = {
      ASSIGNMENT: 'New assignment posted in {subject}',
      GRADE: 'Grade posted for {assignment}',
      ATTENDANCE: 'Attendance recorded for {date}',
      ANNOUNCEMENT: 'New school announcement: {title}',
      MESSAGE: 'New message from {sender}',
      EVENT: 'Upcoming event: {event}'
    }
    
    // Create notifications for students and parents
    const notificationRecipients = [...context.students, ...context.parents]
    
    for (const recipient of notificationRecipients.slice(0, 15)) { // Limit notifications
      const notificationCount = 2 + Math.floor(Math.random() * 4)
      
      for (let i = 0; i < notificationCount; i++) {
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const template = notificationTemplates[type]
        const title = `${type.charAt(0) + type.slice(1).toLowerCase()} Notification`
        
        await prisma.notification.create({
          data: {
            title,
            content: template.replace('{subject}', 'Mathematics')
                              .replace('{assignment}', 'Quiz 1')
                              .replace('{date}', 'today')
                              .replace('{title}', 'Important Update')
                              .replace('{sender}', 'Teacher')
                              .replace('{event}', 'Parent Meeting'),
            type: type as any,
            isRead: Math.random() < 0.3, // 30% chance of being read
            userId: recipient.id,
            data: { additionalInfo: 'Generated notification' }
          }
        })
        notificationsCreated++
      }
    }
    console.log(`✅ Created ${notificationsCreated} notifications`)

    // ============================================
    // 19. CREATE STUDENT ACCOUNTS AND FINANCIAL DATA
    // ============================================
    console.log('\n💰 Creating student accounts and financial data...')
    let accountsCreated = 0
    let invoicesCreated = 0
    let paymentsCreated = 0
    
    for (const student of context.students.slice(0, 10)) { // Limit financial records
      // Create student account
      const account = await prisma.studentAccount.create({
        data: {
          studentId: student.id,
          balance: Math.floor(Math.random() * 1000) + 500 // $500-$1500 balance
        }
      })
      accountsCreated++
      
      // Create 1-3 invoices per student
      const invoiceCount = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < invoiceCount; i++) {
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-2025-${String(1000 + accountsCreated * 10 + i).padStart(4, '0')}`,
            status: ['PENDING', 'PAID', 'OVERDUE'][Math.floor(Math.random() * 3)] as any,
            dueDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000), // Due in next 60 days
            total: 250 + Math.floor(Math.random() * 500), // $250-$750
            notes: ['Tuition fee', 'Lab fee', 'Activity fee', 'Library fee'][Math.floor(Math.random() * 4)],
            accountId: account.id
          }
        })
        
        // Create invoice items
        await prisma.invoiceItem.create({
          data: {
            description: 'Academic fee',
            quantity: 1,
            unitPrice: invoice.total,
            total: invoice.total,
            invoiceId: invoice.id
          }
        })
        
        invoicesCreated++
        
        // Create payment for some invoices (60% chance)
        if (Math.random() < 0.6) {
          await prisma.payment.create({
            data: {
              amount: invoice.total,
              method: ['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE'][Math.floor(Math.random() * 4)] as any,
              reference: `PAY-${invoice.invoiceNumber}`,
              notes: 'Payment received',
              receivedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Paid in last 30 days
              accountId: account.id
            }
          })
          paymentsCreated++
        }
      }
    }
    console.log(`✅ Created ${accountsCreated} student accounts, ${invoicesCreated} invoices, and ${paymentsCreated} payments`)

    // ============================================
    // 20. CREATE AUDIT LOGS
    // ============================================
    console.log('\n📋 Creating audit logs...')
    let auditLogsCreated = 0
    
    const auditActions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW']
    const auditEntities = ['Assignment', 'Grade', 'Attendance', 'User', 'Class', 'Subject']
    
    // Create audit logs for various actions
    for (let i = 0; i < 25; i++) {
      const entity = auditEntities[Math.floor(Math.random() * auditEntities.length)]
      const action = auditActions[Math.floor(Math.random() * auditActions.length)]
      const actor = [...context.teachers, ...context.students][Math.floor(Math.random() * (context.teachers.length + context.students.length))]
      
      await prisma.auditLog.create({
        data: {
          entity,
          entityId: `entity_${Math.floor(Math.random() * 1000)}`,
          action,
          changes: { 
            field: 'example_field', 
            oldValue: 'old_value', 
            newValue: 'new_value' 
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          actorId: actor.id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
        }
      })
      auditLogsCreated++
    }
    console.log(`✅ Created ${auditLogsCreated} audit log entries`)

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n🎉 Contextual database seeding completed!')
    console.log('\n📊 Summary of Created Data:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ School: ${context.school.name}`)
    console.log(`✅ Users: ${context.users.length} total`)
    console.log(`   - Teachers: ${context.teachers.length}`)
    console.log(`   - Students: ${context.students.length}`)
    console.log(`   - Parents: ${context.parents.length}`)
    console.log(`✅ Subjects: ${context.subjects.length}`)
    console.log(`✅ Classes: ${context.classes.length}`)
    console.log(`✅ Active Term: ${activeTerm.name}`)
    console.log(`✅ Rooms & Periods: Created infrastructure`)
    console.log(`✅ Class-Subject Assignments: ${classSubjectsCreated}`)
    console.log(`✅ Student Enrollments: ${enrollmentsCreated}`)
    console.log(`✅ Assignments: ${assignmentsCreated}`)
    console.log(`✅ Assignment Submissions: ${submissionsCreated}`)
    console.log(`✅ Lesson Plans: ${lessonPlansCreated}`)
    console.log(`✅ Attendance Sessions: ${attendanceSessionsCreated}`)
    console.log(`✅ Grade Items & Grades: ${gradeItemsCreated} items, ${gradesCreated} grades`)
    console.log(`✅ Educational Resources: ${resourcesCreated}`)
    console.log(`✅ School Events: ${eventsCreated}`)
    console.log(`✅ Announcements: ${announcementsCreated}`)
    console.log(`✅ Parent-Child Relationships: ${relationshipsCreated}`)
    console.log(`✅ Class Meetings/Schedules: ${classMeetingsCreated}`)
    console.log(`✅ Conversations & Messages: ${conversationsCreated} conversations, ${messagesCreated} messages`)
    console.log(`✅ Notifications: ${notificationsCreated}`)
    console.log(`✅ Financial Records: ${accountsCreated} accounts, ${invoicesCreated} invoices, ${paymentsCreated} payments`)
    console.log(`✅ Audit Logs: ${auditLogsCreated}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n💡 Next Steps:')
    console.log('1. Review the comprehensive data in your database')
    console.log('2. Update Clerk IDs as real users register through the app')
    console.log('3. Test all features with the realistic mock data')
    console.log('4. Start your development server: npm run dev')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('❌ Error during contextual seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
