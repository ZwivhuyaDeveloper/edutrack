const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDuplicateUsers() {
  try {
    console.log('🔍 Checking for duplicate users...\n')
    
    // Check for duplicate emails
    const duplicateEmails = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `
    
    if (duplicateEmails.length > 0) {
      console.log('❌ Found duplicate emails:')
      duplicateEmails.forEach(row => {
        console.log(`  - ${row.email}: ${row.count} occurrences`)
      })
      console.log()
    } else {
      console.log('✅ No duplicate emails found\n')
    }
    
    // Check for duplicate clerkIds (non-empty)
    const duplicateClerkIds = await prisma.$queryRaw`
      SELECT "clerkId", COUNT(*) as count 
      FROM users 
      WHERE "clerkId" != '' AND "clerkId" IS NOT NULL
      GROUP BY "clerkId" 
      HAVING COUNT(*) > 1
    `
    
    if (duplicateClerkIds.length > 0) {
      console.log('❌ Found duplicate clerkIds:')
      duplicateClerkIds.forEach(row => {
        console.log(`  - ${row.clerkId}: ${row.count} occurrences`)
      })
      console.log()
    } else {
      console.log('✅ No duplicate clerkIds found\n')
    }
    
    // Show users with empty clerkIds
    const emptyClerkIds = await prisma.user.findMany({
      where: {
        clerkId: ''
      },
      select: {
        id: true,
        email: true,
        clerkId: true,
        role: true,
        createdAt: true
      }
    })
    
    if (emptyClerkIds.length > 0) {
      console.log('⚠️  Users with empty/null clerkIds:')
      emptyClerkIds.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`)
      })
      console.log()
    } else {
      console.log('✅ All users have clerkIds\n')
    }
    
    // Show all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        clerkId: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Total users in database: ${allUsers.length}`)
    if (allUsers.length > 0) {
      console.log('\n📋 All users:')
      allUsers.forEach((user, index) => {
        const clerkIdDisplay = user.clerkId || '(empty)'
        const activeStatus = user.isActive ? '✅' : '❌'
        console.log(`  ${index + 1}. ${user.email} | ${user.role} | ClerkID: ${clerkIdDisplay} | ${activeStatus} | ${user.createdAt.toISOString()}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDuplicateUsers()
