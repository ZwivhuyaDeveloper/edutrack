# Schema Optimization Migration Guide

## Overview

This migration optimizes the database schema by removing redundant models, fixing missing relations, and consolidating duplicate functionality.

## Changes Summary

### 🗑️ Models Removed

1. **TeachingAssignment** - Fully redundant with `ClassSubject`
   - `ClassSubject` already tracks teacher-to-class-subject assignments
   - No data loss - all information preserved in `ClassSubject`

2. **FeeRecord** - Replaced by Invoice system
   - Migrated to `Invoice` + `InvoiceItem` + `Payment` models
   - Better integration with `StudentAccount`
   - More flexible billing system

### ✏️ Fields Removed

1. **AssignmentSubmission.grade** - Use `Grade` model instead
2. **AssignmentSubmission.feedback** - Use `Grade` model instead
3. **Message.recipientId** - Use `ConversationParticipant` instead
4. **ResourceLink.termId** - Simplified to only use `classSubjectId`

### ✅ Relations Added

1. **EventAttendee.user** - Added missing relation to `User`
2. **Announcement.createdBy** - Added missing relation to `User`

### 🔧 Relations Fixed

1. **ResourceLink.classSubjectId** - Changed from optional to required
2. **ResourceLink** - Added unique constraint `[resourceId, classSubjectId]`

---

## Migration Steps

### Step 1: Backup Your Database

```bash
# PostgreSQL backup
pg_dump -U your_username -d edutrack > backup_before_optimization.sql

# Or use your database provider's backup tool
```

### Step 2: Run Data Migration Script

This script migrates existing data to the new structure:

```bash
# Install dependencies if needed
npm install

# Run the data migration
npx tsx prisma/migrations/data-migration-optimize-schema.ts
```

**What this script does:**
- ✅ Migrates all `FeeRecord` entries to `Invoice` + `InvoiceItem`
- ✅ Creates `Payment` records for paid fees
- ✅ Migrates `AssignmentSubmission` grades to `Grade` model
- ✅ Removes redundant `TeachingAssignment` records
- ✅ Cleans up `Message.recipientId` references
- ✅ Removes `ResourceLink` entries without `classSubjectId`

### Step 3: Generate Prisma Migration

```bash
npm run prisma:migrate-dev -- --name optimize_schema_remove_redundancies
```

This will:
1. Generate SQL migration from schema changes
2. Apply the migration to your database
3. Regenerate Prisma Client

### Step 4: Update Application Code

Search for and update references to removed models/fields:

#### A. Remove TeachingAssignment References

**Before:**
```typescript
// Creating teaching assignment
await prisma.teachingAssignment.create({
  data: {
    teacherId: teacherId,
    classSubjectId: classSubjectId
  }
})
```

**After:**
```typescript
// Use ClassSubject directly - it already has teacherId
await prisma.classSubject.findUnique({
  where: { id: classSubjectId },
  include: { teacher: true }
})
```

#### B. Update Assignment Grading

**Before:**
```typescript
// Grading in submission
await prisma.assignmentSubmission.update({
  where: { id: submissionId },
  data: {
    grade: 85,
    feedback: "Great work!"
  }
})
```

**After:**
```typescript
// Create proper grade record
const gradeItem = await prisma.gradeItem.findFirst({
  where: { assignmentId: assignmentId }
})

await prisma.grade.create({
  data: {
    points: 85,
    feedback: "Great work!",
    gradeItemId: gradeItem.id,
    studentId: studentId,
    teacherId: teacherId
  }
})
```

#### C. Update Fee Management

**Before:**
```typescript
// Creating fee record
await prisma.feeRecord.create({
  data: {
    description: "Tuition Fee",
    amount: 500,
    dueDate: new Date(),
    studentId: studentId
  }
})
```

**After:**
```typescript
// Create invoice with items
const studentAccount = await prisma.studentAccount.upsert({
  where: { studentId: studentId },
  create: { studentId: studentId, balance: 0 },
  update: {}
})

await prisma.invoice.create({
  data: {
    invoiceNumber: `INV-${Date.now()}`,
    status: 'PENDING',
    dueDate: new Date(),
    total: 500,
    accountId: studentAccount.id,
    items: {
      create: {
        description: "Tuition Fee",
        quantity: 1,
        unitPrice: 500,
        total: 500
      }
    }
  }
})
```

#### D. Update Message Queries

**Before:**
```typescript
// Finding messages by recipient
const messages = await prisma.message.findMany({
  where: { recipientId: userId }
})
```

**After:**
```typescript
// Use conversation participants
const messages = await prisma.message.findMany({
  where: {
    conversation: {
      participants: {
        some: { userId: userId }
      }
    }
  }
})
```

#### E. Update ResourceLink Creation

**Before:**
```typescript
// Linking resource to term
await prisma.resourceLink.create({
  data: {
    resourceId: resourceId,
    termId: termId  // ❌ No longer supported
  }
})
```

**After:**
```typescript
// Link resource to class subject
await prisma.resourceLink.create({
  data: {
    resourceId: resourceId,
    classSubjectId: classSubjectId  // ✅ Required
  }
})
```

---

## Code Search Commands

Use these to find code that needs updating:

```bash
# Find TeachingAssignment references
grep -r "teachingAssignment" src/

# Find FeeRecord references
grep -r "feeRecord" src/

# Find AssignmentSubmission grade/feedback
grep -r "submission.*grade" src/
grep -r "submission.*feedback" src/

# Find Message recipientId
grep -r "recipientId" src/

# Find ResourceLink termId
grep -r "resourceLink.*termId" src/
```

---

## Testing Checklist

After migration, test these features:

### Teacher Assignment
- [ ] Teachers can view their assigned classes
- [ ] Class subjects show correct teacher information
- [ ] Teacher schedules display properly

### Grading System
- [ ] Teachers can grade assignments
- [ ] Students can view their grades
- [ ] Grade calculations work correctly
- [ ] Gradebook displays all grades

### Fee Management
- [ ] New invoices can be created
- [ ] Payments can be recorded
- [ ] Student account balances update correctly
- [ ] Invoice history displays properly

### Messaging
- [ ] Messages send correctly
- [ ] Conversation participants receive messages
- [ ] Message history displays properly

### Resources
- [ ] Resources can be linked to class subjects
- [ ] Resource visibility works correctly
- [ ] Teachers can share resources with classes

### Events & Announcements
- [ ] Event attendees display correctly
- [ ] Announcement creator shows properly
- [ ] Event RSVP functionality works

---

## Rollback Plan

If issues occur, you can rollback:

### Option 1: Database Restore
```bash
# Restore from backup
psql -U your_username -d edutrack < backup_before_optimization.sql
```

### Option 2: Revert Migration
```bash
# Check migration history
npx prisma migrate status

# Rollback last migration (if needed)
# Note: This may require manual SQL
```

---

## Benefits of This Optimization

1. **Reduced Complexity**
   - 2 fewer models to maintain
   - Clearer data relationships
   - Less code duplication

2. **Better Data Integrity**
   - Proper foreign key constraints
   - No orphaned records
   - Consistent grading system

3. **Improved Performance**
   - Fewer joins required
   - Better query optimization
   - Reduced database size

4. **Enhanced Maintainability**
   - Single source of truth for each concept
   - Easier to understand data flow
   - Better type safety

---

## Support

If you encounter issues during migration:

1. Check the console output from the data migration script
2. Review the Prisma migration SQL
3. Test in a development environment first
4. Keep database backups accessible

---

## Migration Completion Checklist

- [ ] Database backed up
- [ ] Data migration script executed successfully
- [ ] Prisma migration generated and applied
- [ ] Application code updated
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Production deployment planned

---

**Last Updated:** 2025-10-08
**Migration Version:** optimize_schema_remove_redundancies
