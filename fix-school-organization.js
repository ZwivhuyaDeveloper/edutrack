// Fix school by creating Clerk organization
const { PrismaClient } = require('@prisma/client')
const { clerkClient } = require('@clerk/clerk-sdk-node')

async function fixSchoolOrganization() {
  const prisma = new PrismaClient()

  try {
    console.log('🔧 Fixing school Clerk organization...\n')
    
    const schoolId = 'cmghv01d80007ymfnz6n4jjmh'
    
    // Get school details
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        users: {
          where: { role: 'PRINCIPAL' },
          select: { id: true, clerkId: true, email: true, firstName: true, lastName: true }
        }
      }
    })

    if (!school) {
      console.log('❌ School not found')
      return
    }

    console.log('School:', school.name)
    console.log('Current Clerk Org ID:', school.clerkOrganizationId || 'NONE')
    
    if (school.users.length === 0) {
      console.log('❌ No principal found for this school')
      return
    }

    const principal = school.users[0]
    console.log('Principal:', principal.firstName, principal.lastName, principal.email)

    if (!principal.clerkId) {
      console.log('❌ Principal has no Clerk ID')
      return
    }

    // Create Clerk organization
    console.log('\n📝 Creating Clerk organization...')
    
    const organization = await clerkClient.organizations.createOrganization({
      name: school.name,
      slug: school.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      createdBy: principal.clerkId
    })

    console.log('✅ Clerk organization created:', organization.id)

    // Update school with organization ID
    await prisma.school.update({
      where: { id: schoolId },
      data: { clerkOrganizationId: organization.id }
    })

    console.log('✅ School updated with Clerk organization ID')

    // Add principal to organization as admin
    await clerkClient.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: principal.clerkId,
      role: 'org:admin'
    })

    console.log('✅ Principal added to organization as admin')
    console.log('\n🎉 School fix completed successfully!')

  } catch (error) {
    console.error('❌ Error fixing school:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSchoolOrganization()
