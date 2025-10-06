# EduTrack Database Schema Documentation

## Overview
This document provides a comprehensive overview of the EduTrack school management system database schema. The schema is designed to support all role-based features for Students, Teachers, Parents, Principals, Clerks, and Admins.

## Database Architecture

### Core Principles
- **Multi-tenancy**: All data is scoped by `schoolId` to support multiple schools
- **Role-based Access**: User roles determine access to features and data
- **Audit Trail**: All critical operations are logged in the audit system
- **Referential Integrity**: Proper foreign keys and cascading deletes ensure data consistency

## Schema Modules

### 1. Core Identity & School Management

#### School
Central entity representing an educational institution.
- **Fields**: name, address, city, state, zipCode, country, phone, email, website, logo, isActive
- **Relations**: users, classes, subjects, terms, rooms, periods, resources, events, announcements

#### User
Core user entity integrated with Clerk authentication.
- **Fields**: clerkId (Clerk auth ID), email, firstName, lastName, role, avatar, isActive
- **Roles**: STUDENT, TEACHER, PARENT, PRINCIPAL, CLERK, ADMIN
- **Relations**: Profile-specific relations based on role, enrollments, assignments, messages, notifications

#### Profile Models
Role-specific profile data:
- **StudentProfile**: dateOfBirth, grade, studentIdNumber, emergencyContact, medicalInfo, address
- **TeacherProfile**: employeeId, department, hireDate, salary, qualifications
- **ParentProfile**: phone, address, emergencyContact
- **PrincipalProfile**: employeeId, hireDate, phone, address, emergencyContact, qualifications, yearsOfExperience, previousSchool, educationBackground, salary, administrativeArea
- **ClerkProfile**: employeeId, department, hireDate, phone, address

#### ParentChildRelationship
Links parents to their children (students).
- **Fields**: parentId, childId, relationship (PARENT, GUARDIAN, GRANDPARENT, SIBLING)

---

### 2. Academic Structure

#### Class
Represents a class/section in the school.
- **Fields**: name, grade, section
- **Relations**: enrollments, assignments, subjects (via ClassSubject)

#### Subject
Academic subjects taught in the school.
- **Fields**: name, code, description
- **Relations**: classSubjects, assignments

#### ClassSubject
Junction table linking classes, subjects, and teachers.
- **Fields**: classId, subjectId, teacherId
- **Relations**: teachingAssignments, gradeCategories, gradeItems, attendanceSessions, classMeetings, resourceLinks, lessonPlans

#### Enrollment
Student enrollment in classes.
- **Fields**: studentId, classId, enrolledAt, status (ACTIVE, INACTIVE, TRANSFERRED, GRADUATED)

#### Term
Academic terms/semesters.
- **Fields**: name, startDate, endDate, isActive
- **Relations**: assignments, resourceLinks

---

### 3. Assignment & Submission System

#### Assignment
Homework and assignments created by teachers.
- **Fields**: title, description, dueDate, maxPoints, classId, subjectId, termId
- **Relations**: submissions, gradeItems

#### AssignmentSubmission
Student submissions for assignments.
- **Fields**: assignmentId, studentId, content, attachments (file URLs), submittedAt, grade, feedback
- **Unique**: (assignmentId, studentId)

---

### 4. Gradebook & Grading System

#### GradeCategory
Categories for organizing grades (e.g., "Homework", "Exams", "Projects").
- **Fields**: name, weight (percentage), description, classSubjectId
- **Relations**: gradeItems

#### GradeItem
Individual gradable items (assignments, quizzes, participation, etc.).
- **Fields**: name, description, maxPoints, date, classSubjectId, categoryId, assignmentId
- **Relations**: grades

#### Grade
Individual student grades for grade items.
- **Fields**: points, feedback, gradedAt, gradeItemId, studentId, teacherId
- **Unique**: (gradeItemId, studentId)
- **Indexes**: studentId, teacherId

---

### 5. Attendance System

#### AttendanceSession
Attendance taking session for a class.
- **Fields**: date, notes, classSubjectId, createdById
- **Relations**: records (Attendance)
- **Index**: (classSubjectId, date)

#### Attendance
Individual student attendance records.
- **Fields**: status (PRESENT, ABSENT, LATE, EXCUSED), notes, sessionId, studentId
- **Unique**: (sessionId, studentId)
- **Index**: studentId

---

### 6. Scheduling & Timetable

#### Room
Physical classrooms and spaces.
- **Fields**: name, building, capacity, floor, facilities (array)
- **Relations**: classMeetings

#### Period
Time slots for classes (e.g., "Period 1", "Morning Session").
- **Fields**: name, startTime (HH:MM), endTime (HH:MM), order
- **Relations**: classMeetings

#### ClassMeeting
Scheduled class meetings (timetable entries).
- **Fields**: dayOfWeek (0-6), classSubjectId, periodId, roomId
- **Index**: classSubjectId

---

### 7. Messaging & Communication

#### Conversation
Message threads between users.
- **Fields**: title, isGroup, schoolId
- **Relations**: participants, messages

#### ConversationParticipant
Users participating in conversations.
- **Fields**: conversationId, userId, joinedAt, lastReadAt
- **Unique**: (conversationId, userId)

#### Message
Individual messages in conversations.
- **Fields**: content, status (SENT, DELIVERED, READ), conversationId, senderId, recipientId, sentAt
- **Relations**: attachments
- **Indexes**: conversationId, senderId

#### MessageAttachment
File attachments for messages.
- **Fields**: url, filename, fileType, fileSize, messageId

---

### 8. Resource Library

#### Resource
Learning materials and teaching resources.
- **Fields**: title, description, url, type (DOCUMENT, VIDEO, LINK, PRESENTATION, SPREADSHEET, IMAGE, OTHER), visibility (SCHOOL, CLASS, SUBJECT, PRIVATE), fileSize, schoolId, ownerId
- **Relations**: tags, links
- **Indexes**: schoolId, ownerId

#### ResourceTag
Tags for categorizing resources.
- **Fields**: name (unique)
- **Relations**: resources (via ResourceTagJoin)

#### ResourceTagJoin
Many-to-many junction for resources and tags.
- **Unique**: (resourceId, tagId)

#### ResourceLink
Links resources to classes/subjects/terms.
- **Fields**: resourceId, classSubjectId, termId

---

### 9. Calendar & Events

#### Event
School events and calendar items.
- **Fields**: title, description, startDate, endDate, location, type (HOLIDAY, EXAM, MEETING, SPORTS, CULTURAL, PARENT_TEACHER, OTHER), isAllDay, schoolId, createdById
- **Relations**: audiences, attendees
- **Index**: (schoolId, startDate)

#### EventAudience
Defines who should see the event.
- **Fields**: scope (SCHOOL, CLASS, SUBJECT, USER), eventId, classId, subjectId

#### EventAttendee
Event RSVP tracking.
- **Fields**: rsvpStatus, eventId, userId
- **Unique**: (eventId, userId)

---

### 10. Fees, Billing & Payments

#### StudentAccount
Financial account for each student.
- **Fields**: balance, studentId
- **Relations**: invoices, payments

#### Invoice
Billing invoices for students.
- **Fields**: invoiceNumber (unique), status (PENDING, PAID, OVERDUE, CANCELLED, REFUNDED), dueDate, total, notes, accountId
- **Relations**: items
- **Index**: accountId

#### InvoiceItem
Line items on invoices.
- **Fields**: description, quantity, unitPrice, total, invoiceId

#### Payment
Payment records.
- **Fields**: amount, method (CASH, CARD, BANK_TRANSFER, CHEQUE, ONLINE, OTHER), reference, notes, receivedAt, accountId, processedById
- **Index**: accountId

#### FeeRecord
Simple fee tracking (alternative to invoice system).
- **Fields**: description, amount, dueDate, paid, paidAt, studentId, clerkId
- **Index**: studentId

---

### 11. Lesson Planning

#### LessonPlan
Teacher lesson plans.
- **Fields**: title, date, objectives, materials, activities, homework, notes, status (DRAFT, PUBLISHED, COMPLETED), classSubjectId, teacherId
- **Relations**: attachments
- **Indexes**: (classSubjectId, date), teacherId

#### LessonPlanAttachment
Attachments for lesson plans.
- **Fields**: url, filename, fileType, lessonPlanId

---

### 12. Notifications & Announcements

#### Announcement
School-wide or targeted announcements.
- **Fields**: title, content, scope (SCHOOL, CLASS, SUBJECT, USER), priority, schoolId, createdById, publishedAt, expiresAt
- **Index**: (schoolId, publishedAt)

#### Notification
User-specific notifications.
- **Fields**: title, content, type (ASSIGNMENT, GRADE, ATTENDANCE, FEE, ANNOUNCEMENT, MESSAGE, EVENT, SYSTEM), isRead, data (JSON), userId, readAt
- **Index**: (userId, isRead)

---

### 13. Audit & Governance

#### AuditLog
Comprehensive audit trail for all critical operations.
- **Fields**: entity, entityId, action, changes (JSON diff), ipAddress, userAgent, actorId, createdAt
- **Indexes**: (entity, entityId), actorId, createdAt

---

## Enums Reference

### UserRole
- STUDENT
- TEACHER
- PARENT
- PRINCIPAL
- CLERK
- ADMIN

### RelationshipType
- PARENT
- GUARDIAN
- GRANDPARENT
- SIBLING

### EnrollmentStatus
- ACTIVE
- INACTIVE
- TRANSFERRED
- GRADUATED

### AttendanceStatus
- PRESENT
- ABSENT
- LATE
- EXCUSED

### ResourceType
- DOCUMENT
- VIDEO
- LINK
- PRESENTATION
- SPREADSHEET
- IMAGE
- OTHER

### ResourceVisibility
- SCHOOL
- CLASS
- SUBJECT
- PRIVATE

### EventType
- HOLIDAY
- EXAM
- MEETING
- SPORTS
- CULTURAL
- PARENT_TEACHER
- OTHER

### EventScope
- SCHOOL
- CLASS
- SUBJECT
- USER

### PaymentStatus
- PENDING
- PAID
- OVERDUE
- CANCELLED
- REFUNDED

### PaymentMethod
- CASH
- CARD
- BANK_TRANSFER
- CHEQUE
- ONLINE
- OTHER

### NotificationType
- ASSIGNMENT
- GRADE
- ATTENDANCE
- FEE
- ANNOUNCEMENT
- MESSAGE
- EVENT
- SYSTEM

### MessageStatus
- SENT
- DELIVERED
- READ

### LessonPlanStatus
- DRAFT
- PUBLISHED
- COMPLETED

---

## Key Indexes

Performance-critical indexes have been added to:
- Foreign key columns (schoolId, userId, classId, etc.)
- Frequently queried combinations (classSubjectId + date, schoolId + startDate)
- User-specific queries (userId + isRead for notifications)
- Audit queries (entity + entityId, createdAt)

---

## Feature Coverage by Role

### 👨‍🎓 Student Features
- ✅ Dashboard (enrollments, assignments, grades, attendance)
- ✅ Course Management (enrollments, classSubjects)
- ✅ Assignment Center (assignments, submissions)
- ✅ Grade Portal (grades, gradeItems)
- ✅ Attendance Tracker (attendance records)
- ✅ Resource Library (resources with visibility)
- ✅ Messaging (conversations, messages)
- ✅ Progress Analytics (grades, attendance data)

### 👩‍🏫 Teacher Features
- ✅ Teacher Dashboard (classSubjects, assignments)
- ✅ Gradebook (gradeCategories, gradeItems, grades)
- ✅ Attendance Manager (attendanceSessions, attendance)
- ✅ Lesson Planner (lessonPlans)
- ✅ Assignment Creator (assignments, gradeItems)
- ✅ Class Analytics (grades, attendance aggregations)
- ✅ Parent Communication (messages, conversations)
- ✅ Resource Manager (resources)

### 👨‍👩‍👧 Parent Features
- ✅ Parent Dashboard (parentChildRelationship, notifications)
- ✅ Child Progress (grades via children)
- ✅ Attendance Monitor (attendance via children)
- ✅ Assignment Tracker (assignments via children)
- ✅ Teacher Communication (messages)
- ✅ School Calendar (events)
- ✅ Fee Portal (studentAccount, invoices, payments)

### 📊 Clerk Features
- ✅ Admin Dashboard (school-wide metrics)
- ✅ Student Management (users, studentProfile, enrollments)
- ✅ Staff Management (users, teacherProfile, principalProfile)
- ✅ Attendance System (attendance, attendanceSessions)
- ✅ Fee Management (studentAccount, invoices, payments, feeRecords)
- ✅ Scheduling (rooms, periods, classMeetings)
- ✅ Reporting (audit logs, analytics queries)

### 🎯 Principal Features
- ✅ Principal Dashboard (school-wide aggregations)
- ✅ Staff Management (users with TEACHER/CLERK roles)
- ✅ Academic Analytics (grades, attendance, enrollments)
- ✅ Financial Overview (invoices, payments aggregations)
- ✅ Strategic Planning (terms, subjects, classes)
- ✅ Compliance & Reporting (auditLogs)
- ✅ School Calendar (events, announcements)

---

## Migration Strategy

### Phase 1: Core Setup ✅
- User roles and profiles
- School, Class, Subject structure
- Basic enrollments

### Phase 2: Academic Features ✅
- Assignments and submissions
- Gradebook system
- Attendance tracking

### Phase 3: Communication ✅
- Messaging system
- Notifications
- Announcements

### Phase 4: Advanced Features ✅
- Resource library
- Calendar and events
- Lesson planning

### Phase 5: Financial ✅
- Fee management
- Billing and invoices
- Payment processing

### Phase 6: Governance ✅
- Audit logging
- Scheduling system
- Analytics support

---

## Next Steps

1. **API Development**: Create REST/GraphQL endpoints for each module
2. **Seed Data**: Populate with sample schools, users, and data for testing
3. **Access Control**: Implement role-based permissions in API layer
4. **Analytics Views**: Create database views for common reporting queries
5. **Performance Optimization**: Add additional indexes based on query patterns
6. **Data Validation**: Add application-level validation rules
7. **Backup Strategy**: Implement automated backup and recovery procedures

---

## Technical Notes

- **Database**: PostgreSQL
- **ORM**: Prisma
- **ID Strategy**: CUID for all primary keys
- **Timestamps**: All models have createdAt/updatedAt
- **Soft Deletes**: Not implemented (using hard deletes with CASCADE)
- **File Storage**: URLs stored in database, actual files in external storage (S3, etc.)
- **JSON Fields**: Used for flexible metadata (notification.data, auditLog.changes)

---

**Last Updated**: 2025-10-06
**Schema Version**: 1.0.0
**Total Models**: 40+
**Total Enums**: 11
