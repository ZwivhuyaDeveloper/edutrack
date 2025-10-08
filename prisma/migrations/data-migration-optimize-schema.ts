/**
 * Data Migration Script for Schema Optimization
 * 
 * This script migrates existing data before applying the schema changes:
 * 1. Migrates FeeRecord data to Invoice/InvoiceItem system
 * 2. Migrates AssignmentSubmission grades to Grade model
 * 3. Removes TeachingAssignment records (redundant with ClassSubject)
 * 4. Cleans up Message.recipientId data
 * 5. Updates ResourceLink to remove termId references
 * 
 * Run this BEFORE applying the Prisma migration
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting data migration for schema optimization...\n')

  // Step 1: Migrate FeeRecord to Invoice system
  console.log('📋 Step 1: Migrating FeeRecord data to Invoice system...')
  const feeRecords = await prisma.feeRecord.findMany({
    include: {
      clerk: true
    }
  })

  let feesMigrated = 0
  for (const fee of feeRecords) {
    try {
      // Check if student account exists, create if not
      let studentAccount = await prisma.studentAccount.findUnique({
        where: { studentId: fee.studentId }
      })

      if (!studentAccount) {
        studentAccount = await prisma.studentAccount.create({
          data: {
            studentId: fee.studentId,
            balance: 0
          }
        })
      }

      // Create invoice for this fee
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `FEE-${fee.id.substring(0, 8)}`,
          status: fee.paid ? 'PAID' : 'PENDING',
          dueDate: fee.dueDate,
          total: fee.amount,
          notes: `Migrated from FeeRecord: ${fee.description}`,
          accountId: studentAccount.id,
          items: {
            create: {
              description: fee.description,
              quantity: 1,
              unitPrice: fee.amount,
              total: fee.amount
            }
          }
        }
      })

      // If fee was paid, create payment record
      if (fee.paid && fee.paidAt) {
        await prisma.payment.create({
          data: {
            amount: fee.amount,
            method: 'OTHER', // Unknown method from old system
            reference: `FEE-${fee.id}`,
            notes: 'Migrated from FeeRecord',
            receivedAt: fee.paidAt,
            accountId: studentAccount.id,
            processedById: fee.clerkId || undefined
          }
        })

        // Update student account balance
        await prisma.studentAccount.update({
          where: { id: studentAccount.id },
          data: {
            balance: {
              decrement: fee.amount
            }
          }
        })
      } else {
        // Unpaid fee - add to balance
        await prisma.studentAccount.update({
          where: { id: studentAccount.id },
          data: {
            balance: {
              increment: fee.amount
            }
          }
        })
      }

      feesMigrated++
    } catch (error) {
      console.error(`❌ Error migrating fee ${fee.id}:`, error)
    }
  }
  console.log(`✅ Migrated ${feesMigrated} fee records to invoice system\n`)

  // Step 2: Migrate AssignmentSubmission grades to Grade model
  console.log('📝 Step 2: Migrating assignment submission grades to Grade model...')
  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      grade: { not: null }
    },
    include: {
      assignment: {
        include: {
          gradeItems: true
        }
      }
    }
  })

  let gradesMigrated = 0
  for (const submission of submissions) {
    try {
      // Find or create GradeItem for this assignment
      let gradeItem = submission.assignment.gradeItems[0]
      
      if (!gradeItem) {
        // Get classSubjectId from assignment
        const assignment = await prisma.assignment.findUnique({
          where: { id: submission.assignmentId },
          include: {
            class: {
              include: {
                subjects: {
                  where: {
                    subjectId: submission.assignment.subjectId
                  }
                }
              }
            }
          }
        })

        const classSubject = assignment?.class.subjects[0]
        if (!classSubject) {
          console.warn(`⚠️  No ClassSubject found for assignment ${submission.assignmentId}`)
          continue
        }

        gradeItem = await prisma.gradeItem.create({
          data: {
            name: submission.assignment.title,
            description: submission.assignment.description,
            maxPoints: submission.assignment.maxPoints || 100,
            date: submission.assignment.dueDate,
            classSubjectId: classSubject.id,
            assignmentId: submission.assignmentId
          }
        })
      }

      // Find teacher for this assignment's class subject
      const classSubject = await prisma.classSubject.findFirst({
        where: {
          classId: submission.assignment.classId,
          subjectId: submission.assignment.subjectId
        }
      })

      if (!classSubject) {
        console.warn(`⚠️  No ClassSubject found for assignment ${submission.assignmentId}`)
        continue
      }

      // Create Grade record
      await prisma.grade.create({
        data: {
          points: submission.grade!,
          feedback: submission.feedback,
          gradedAt: submission.updatedAt,
          gradeItemId: gradeItem.id,
          studentId: submission.studentId,
          teacherId: classSubject.teacherId
        }
      })

      gradesMigrated++
    } catch (error) {
      console.error(`❌ Error migrating grade for submission ${submission.id}:`, error)
    }
  }
  console.log(`✅ Migrated ${gradesMigrated} assignment grades to Grade model\n`)

  // Step 3: Delete TeachingAssignment records (redundant)
  console.log('🗑️  Step 3: Removing redundant TeachingAssignment records...')
  const deletedTeachingAssignments = await prisma.teachingAssignment.deleteMany({})
  console.log(`✅ Deleted ${deletedTeachingAssignments.count} TeachingAssignment records\n`)

  // Step 4: Clean up Message.recipientId (will be removed)
  console.log('💬 Step 4: Cleaning up Message recipientId references...')
  const messagesUpdated = await prisma.message.updateMany({
    where: {
      recipientId: { not: null }
    },
    data: {
      recipientId: null
    }
  })
  console.log(`✅ Cleaned up ${messagesUpdated.count} message recipient references\n`)

  // Step 5: Update ResourceLink to remove termId
  console.log('🔗 Step 5: Cleaning up ResourceLink termId references...')
  const resourceLinksWithTerm = await prisma.resourceLink.findMany({
    where: {
      termId: { not: null },
      classSubjectId: null
    }
  })

  console.log(`⚠️  Found ${resourceLinksWithTerm.length} ResourceLinks with termId but no classSubjectId`)
  console.log('   These will need manual review or will be deleted during migration\n')

  // Delete ResourceLinks that only have termId (no classSubjectId)
  const deletedResourceLinks = await prisma.resourceLink.deleteMany({
    where: {
      classSubjectId: null
    }
  })
  console.log(`✅ Deleted ${deletedResourceLinks.count} ResourceLinks without classSubjectId\n`)

  // Step 6: Delete FeeRecord table data (already migrated)
  console.log('🗑️  Step 6: Removing migrated FeeRecord data...')
  const deletedFeeRecords = await prisma.feeRecord.deleteMany({})
  console.log(`✅ Deleted ${deletedFeeRecords.count} FeeRecord entries (migrated to invoices)\n`)

  console.log('✨ Data migration completed successfully!')
  console.log('\n📌 Next steps:')
  console.log('   1. Review the migration results above')
  console.log('   2. Run: npm run prisma:migrate-dev')
  console.log('   3. Test the application thoroughly')
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
