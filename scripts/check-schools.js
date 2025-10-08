const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSchools() {
  try {
    console.log('🔍 Checking schools and their Clerk organization IDs...\n')
    
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        clerkOrganizationId: true,
        isActive: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    console.log(`Found ${schools.length} schools:\n`)
    
    schools.forEach((school, index) => {
      console.log(`${index + 1}. School: ${school.name}`)
      console.log(`    ID: ${school.id}`)
      console.log(`    Clerk Org ID: ${school.clerkOrganizationId || 'MISSING'}`)
      console.log(`    Active: ${school.isActive}`)
      console.log(`    Users: ${school._count.users}`)
      console.log('---')
    })

    const schoolsWithoutClerkOrg = schools.filter(s => !s.clerkOrganizationId)
    
    if (schoolsWithoutClerkOrg.length > 0) {
      console.log('⚠️  Schools without Clerk Organization IDs:')
      schoolsWithoutClerkOrg.forEach(school => {
        console.log(`   - ${school.name} (ID: ${school.id})`)
      })
      console.log('\n💡 Users cannot join schools without Clerk Organization IDs!')
    }

    console.log('\n🔍 Checking users...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        school: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`Found ${users.length} users in database:\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`)
      console.log(`   Clerk ID: ${user.clerkId}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   School: ${user.school?.name || 'No school'}`)
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`)
      console.log('')
    })

  } catch (error) {
    console.error('Error checking schools:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSchools()
