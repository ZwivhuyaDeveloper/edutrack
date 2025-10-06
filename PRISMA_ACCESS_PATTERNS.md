# Prisma Access Patterns by Role

## Overview
This document outlines how each user role accesses Prisma models based on their relationships and permissions.

---

## 🎓 STUDENT Access Patterns

### Direct Relationships
```prisma
User (STUDENT) {
  studentProfile: StudentProfile (1:1)
  enrollments: Enrollment[] (1:many)
  assignmentSubmissions: AssignmentSubmission[] (1:many)
  gradesReceived: Grade[] (1:many)
  attendanceRecords: Attendance[] (1:many)
  sentMessages: Message[] (1:many)
  receivedMessages: Message[] (1:many)
  notifications: Notification[] (1:many)
  childRelationships: ParentChildRelationship[] (1:many) // Links to parents
}
```

### Access Patterns

#### ✅ **Own Profile**
```typescript
// Read/Update own profile
const student = await prisma.user.findUnique({
  where: { clerkId: userId },
  include: { studentProfile: true, school: true }
})
```

#### ✅ **Classes & Enrollments**
```typescript
// Get enrolled classes
const enrollments = await prisma.enrollment.findMany({
  where: { 
    studentId: user.id,
    status: 'ACTIVE'
  },
  include: {
    class: {
      include: {
        subjects: {
          include: {
            subject: true,
            teacher: true
          }
        }
      }
    }
  }
})
```

#### ✅ **Assignments**
```typescript
// Get assignments for enrolled classes
const classIds = enrollments.map(e => e.classId)
const assignments = await prisma.assignment.findMany({
  where: {
    classId: { in: classIds },
    dueDate: { gte: new Date() }
  },
  include: {
    subject: true,
    submissions: {
      where: { studentId: user.id }
    }
  }
})
```

#### ✅ **Submit Assignment**
```typescript
// Create submission
const submission = await prisma.assignmentSubmission.create({
  data: {
    assignmentId: assignmentId,
    studentId: user.id,
    content: content,
    attachments: files
  }
})
```

#### ✅ **Grades**
```typescript
// Get own grades
const grades = await prisma.grade.findMany({
  where: { studentId: user.id },
  include: {
    gradeItem: {
      include: {
        classSubject: {
          include: { subject: true }
        }
      }
    }
  },
  orderBy: { gradedAt: 'desc' }
})
```

#### ✅ **Schedule**
```typescript
// Get today's schedule
const today = new Date().getDay()
const schedule = await prisma.classMeeting.findMany({
  where: {
    dayOfWeek: today,
    classSubject: {
      class: {
        enrollments: {
          some: { studentId: user.id }
        }
      }
    }
  },
  include: {
    period: true,
    room: true,
    classSubject: {
      include: {
        subject: true,
        teacher: true
      }
    }
  }
})
```

#### ✅ **Attendance**
```typescript
// View own attendance
const attendance = await prisma.attendance.findMany({
  where: { studentId: user.id },
  include: {
    session: {
      include: {
        classSubject: {
          include: { subject: true }
        }
      }
    }
  }
})
```

#### ❌ **Cannot Access**
- Other students' data
- Teacher-only resources
- Grade creation/modification
- Class management
- Financial records of other students

---

## 👨‍🏫 TEACHER Access Patterns

### Direct Relationships
```prisma
User (TEACHER) {
  teacherProfile: TeacherProfile (1:1)
  teachingAssignments: TeachingAssignment[] (1:many)
  classSubjects: ClassSubject[] (1:many) // Classes they teach
  gradesGiven: Grade[] (1:many)
  lessonPlans: LessonPlan[] (1:many)
  attendanceSessionsCreated: AttendanceSession[] (1:many)
  resourcesCreated: Resource[] (1:many)
  eventsCreated: Event[] (1:many)
}
```

### Access Patterns

#### ✅ **Own Classes**
```typescript
// Get classes taught by teacher
const classSubjects = await prisma.classSubject.findMany({
  where: { teacherId: user.id },
  include: {
    class: {
      include: {
        enrollments: {
          include: {
            student: {
              include: { studentProfile: true }
            }
          }
        }
      }
    },
    subject: true
  }
})
```

#### ✅ **Students in Classes**
```typescript
// Get all students in teacher's classes
const students = await prisma.user.findMany({
  where: {
    role: 'STUDENT',
    enrollments: {
      some: {
        class: {
          subjects: {
            some: { teacherId: user.id }
          }
        }
      }
    }
  },
  include: {
    studentProfile: true,
    enrollments: {
      where: {
        class: {
          subjects: {
            some: { teacherId: user.id }
          }
        }
      }
    }
  }
})
```

#### ✅ **Create/Manage Assignments**
```typescript
// Create assignment for own class
const assignment = await prisma.assignment.create({
  data: {
    title: title,
    description: description,
    dueDate: dueDate,
    maxPoints: maxPoints,
    classId: classId,
    subjectId: subjectId,
    termId: termId
  }
})

// View submissions
const submissions = await prisma.assignmentSubmission.findMany({
  where: {
    assignment: {
      class: {
        subjects: {
          some: { teacherId: user.id }
        }
      }
    }
  },
  include: {
    student: true,
    assignment: true
  }
})
```

#### ✅ **Grade Students**
```typescript
// Create/update grade
const grade = await prisma.grade.upsert({
  where: {
    gradeItemId_studentId: {
      gradeItemId: gradeItemId,
      studentId: studentId
    }
  },
  create: {
    gradeItemId: gradeItemId,
    studentId: studentId,
    teacherId: user.id,
    points: points,
    feedback: feedback
  },
  update: {
    points: points,
    feedback: feedback
  }
})
```

#### ✅ **Manage Attendance**
```typescript
// Create attendance session
const session = await prisma.attendanceSession.create({
  data: {
    date: new Date(),
    classSubjectId: classSubjectId,
    createdById: user.id,
    records: {
      create: students.map(student => ({
        studentId: student.id,
        status: 'PRESENT'
      }))
    }
  }
})
```

#### ✅ **Lesson Plans**
```typescript
// Create lesson plan
const lessonPlan = await prisma.lessonPlan.create({
  data: {
    title: title,
    date: date,
    objectives: objectives,
    activities: activities,
    classSubjectId: classSubjectId,
    teacherId: user.id
  }
})
```

#### ❌ **Cannot Access**
- Classes not assigned to them
- Students not in their classes
- Other teachers' lesson plans
- Financial records
- School-wide settings

---

## 👨‍👩‍👧 PARENT Access Patterns

### Direct Relationships
```prisma
User (PARENT) {
  parentProfile: ParentProfile (1:1)
  parentRelationships: ParentChildRelationship[] (1:many) // Links to children
}
```

### Access Patterns

#### ✅ **Own Children**
```typescript
// Get children
const children = await prisma.parentChildRelationship.findMany({
  where: { parentId: user.id },
  include: {
    child: {
      include: {
        studentProfile: true,
        enrollments: {
          include: {
            class: {
              include: {
                subjects: {
                  include: {
                    subject: true,
                    teacher: true
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})
```

#### ✅ **Children's Grades**
```typescript
// Get grades for all children
const childIds = children.map(c => c.childId)
const grades = await prisma.grade.findMany({
  where: {
    studentId: { in: childIds }
  },
  include: {
    student: true,
    gradeItem: {
      include: {
        classSubject: {
          include: { subject: true }
        }
      }
    }
  }
})
```

#### ✅ **Children's Assignments**
```typescript
// Get assignments for children
const assignments = await prisma.assignment.findMany({
  where: {
    class: {
      enrollments: {
        some: {
          studentId: { in: childIds }
        }
      }
    }
  },
  include: {
    subject: true,
    submissions: {
      where: {
        studentId: { in: childIds }
      }
    }
  }
})
```

#### ✅ **Children's Attendance**
```typescript
// Get attendance for children
const attendance = await prisma.attendance.findMany({
  where: {
    studentId: { in: childIds }
  },
  include: {
    student: true,
    session: {
      include: {
        classSubject: {
          include: { subject: true }
        }
      }
    }
  }
})
```

#### ✅ **Financial Records**
```typescript
// Get fee records for children
const feeRecords = await prisma.feeRecord.findMany({
  where: {
    studentId: { in: childIds }
  }
})

// Make payment
const payment = await prisma.payment.create({
  data: {
    amount: amount,
    method: method,
    accountId: accountId
  }
})
```

#### ❌ **Cannot Access**
- Other students' data
- Teacher resources
- Grade modification
- Attendance modification

---

## 🎯 PRINCIPAL Access Patterns

### Direct Relationships
```prisma
User (PRINCIPAL) {
  principalProfile: PrincipalProfile (1:1)
  school: School (via schoolId)
}
```

### Access Patterns

#### ✅ **School-Wide Access**
```typescript
// Get all users in school
const users = await prisma.user.findMany({
  where: { schoolId: user.schoolId },
  include: {
    studentProfile: true,
    teacherProfile: true,
    parentProfile: true
  }
})

// Get all classes
const classes = await prisma.class.findMany({
  where: { schoolId: user.schoolId },
  include: {
    enrollments: {
      include: { student: true }
    },
    subjects: {
      include: {
        subject: true,
        teacher: true
      }
    }
  }
})

// Get all subjects
const subjects = await prisma.subject.findMany({
  where: { schoolId: user.schoolId }
})

// View all grades (read-only)
const grades = await prisma.grade.findMany({
  where: {
    student: { schoolId: user.schoolId }
  },
  include: {
    student: true,
    gradeItem: true,
    teacher: true
  }
})

// View all attendance
const attendance = await prisma.attendance.findMany({
  where: {
    student: { schoolId: user.schoolId }
  },
  include: {
    student: true,
    session: true
  }
})
```

#### ✅ **Manage School Settings**
```typescript
// Update school
const school = await prisma.school.update({
  where: { id: user.schoolId },
  data: {
    name: name,
    address: address,
    phone: phone
  }
})

// Manage periods
const period = await prisma.period.create({
  data: {
    name: name,
    startTime: startTime,
    endTime: endTime,
    order: order,
    schoolId: user.schoolId
  }
})

// Manage rooms
const room = await prisma.room.create({
  data: {
    name: name,
    building: building,
    capacity: capacity,
    schoolId: user.schoolId
  }
})

// Manage terms
const term = await prisma.term.create({
  data: {
    name: name,
    startDate: startDate,
    endDate: endDate,
    schoolId: user.schoolId
  }
})
```

#### ✅ **Create Announcements**
```typescript
// School-wide announcement
const announcement = await prisma.announcement.create({
  data: {
    title: title,
    content: content,
    priority: priority,
    scope: 'SCHOOL',
    schoolId: user.schoolId,
    createdById: user.id,
    publishedAt: new Date()
  }
})
```

#### ❌ **Cannot Modify**
- Individual grades (view only)
- Teacher lesson plans (view only)
- Assignment submissions

---

## 📋 CLERK (Admin Staff) Access Patterns

### Direct Relationships
```prisma
User (CLERK) {
  clerkProfile: ClerkProfile (1:1)
  feeRecords: FeeRecord[] (via clerkProfile)
  payments: Payment[] (via clerkProfile)
}
```

### Access Patterns

#### ✅ **Student Records Management**
```typescript
// Manage student enrollments
const enrollment = await prisma.enrollment.create({
  data: {
    studentId: studentId,
    classId: classId,
    status: 'ACTIVE'
  }
})

// Update student profile
const student = await prisma.user.update({
  where: { id: studentId },
  data: {
    studentProfile: {
      update: {
        grade: grade,
        studentIdNumber: idNumber
      }
    }
  }
})
```

#### ✅ **Financial Management**
```typescript
// Create fee record
const feeRecord = await prisma.feeRecord.create({
  data: {
    description: description,
    amount: amount,
    dueDate: dueDate,
    studentId: studentId,
    clerkId: user.clerkProfile.id
  }
})

// Process payment
const payment = await prisma.payment.create({
  data: {
    amount: amount,
    method: method,
    accountId: accountId,
    processedById: user.clerkProfile.id
  }
})

// Create invoice
const invoice = await prisma.invoice.create({
  data: {
    invoiceNumber: generateInvoiceNumber(),
    accountId: accountId,
    dueDate: dueDate,
    total: total,
    items: {
      create: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    }
  }
})
```

#### ✅ **Attendance Recording**
```typescript
// Record attendance
const attendance = await prisma.attendance.create({
  data: {
    sessionId: sessionId,
    studentId: studentId,
    status: status,
    notes: notes
  }
})
```

#### ❌ **Cannot Access**
- Grade creation/modification
- Assignment creation
- Lesson plans
- Teaching resources

---

## 🔒 Access Control Summary

### Data Isolation Rules

1. **School Isolation**: All users can only access data from their own school
   ```typescript
   where: { schoolId: user.schoolId }
   ```

2. **Student Isolation**: Students can only see their own data
   ```typescript
   where: { studentId: user.id }
   ```

3. **Teacher Class Isolation**: Teachers can only manage their assigned classes
   ```typescript
   where: {
     classSubject: {
       teacherId: user.id
     }
   }
   ```

4. **Parent-Child Isolation**: Parents can only see their children's data
   ```typescript
   where: {
     studentId: { in: childIds }
   }
   ```

### Relationship Chains

```
STUDENT → Enrollment → Class → ClassSubject → Subject
                                            → Teacher
                                            → ClassMeeting → Period, Room

TEACHER → ClassSubject → Class → Enrollment → Student
                      → Subject
                      → Assignment → AssignmentSubmission
                      → GradeItem → Grade

PARENT → ParentChildRelationship → Student (Child) → [All Student Data]

PRINCIPAL → School → [All School Data]

CLERK → School → [Student Records, Financial Data]
```
