const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetUserPrincipal() {
  try {
    console.log('🔧 Finding principals...\n')
    
    const principals = await prisma.user.findMany({
      where: {
        role: 'PRINCIPAL'
      },
      include: {
        school: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`Found ${principals.length} principals:\n`)
    
    principals.forEach((principal, index) => {
      console.log(`${index + 1}. ${principal.firstName} ${principal.lastName} (${principal.email})`)
      console.log(`   Clerk ID: ${principal.clerkId}`)
      console.log(`   School: ${principal.school?.name || 'No school'}`)
      console.log(`   Active: ${principal.isActive}`)
      console.log('')
    })

    console.log('💡 To reset a principal (for testing purposes):')
    console.log('   1. Delete the user record from the database')
    console.log('   2. Or change their role to something else')
    console.log('   3. Or delete/deactivate their school')
    console.log('\n⚠️  WARNING: This will affect real data. Only do this in development!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetUserPrincipal()
