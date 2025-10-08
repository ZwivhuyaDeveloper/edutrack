const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSchoolOrganizations() {
  try {
    console.log('🔧 Finding schools without Clerk Organization IDs...\n')
    
    const schoolsWithoutOrg = await prisma.school.findMany({
      where: {
        clerkOrganizationId: null,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    console.log(`Found ${schoolsWithoutOrg.length} schools without Clerk Organization IDs:\n`)
    
    schoolsWithoutOrg.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} (${school._count.users} users)`)
    })

    if (schoolsWithoutOrg.length === 0) {
      console.log('✅ All schools already have Clerk Organization IDs!')
      return
    }

    console.log('\n⚠️  These schools need Clerk organizations to allow new user registrations.')
    console.log('💡 Options to fix this:')
    console.log('   1. Create new schools through the /setup-school page (recommended)')
    console.log('   2. Manually create Clerk organizations and update the database')
    console.log('   3. Migrate existing users to schools with Clerk organizations')
    
    // Show schools WITH organizations for reference
    const schoolsWithOrg = await prisma.school.findMany({
      where: {
        clerkOrganizationId: {
          not: null
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        clerkOrganizationId: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    console.log(`\n✅ Schools WITH Clerk Organization IDs (${schoolsWithOrg.length}):\n`)
    
    schoolsWithOrg.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} (${school._count.users} users)`)
      console.log(`   Org ID: ${school.clerkOrganizationId}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSchoolOrganizations()
