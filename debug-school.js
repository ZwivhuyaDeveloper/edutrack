// Debug school and Clerk organization
const { PrismaClient } = require('@prisma/client')

async function debugSchool() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Debugging school with ID: cmghv01d80007ymfnz6n4jjmh\n')
    
    // Get the school details
    const school = await prisma.school.findUnique({
      where: { id: 'cmghv01d80007ymfnz6n4jjmh' },
      include: {
        users: {
          where: { role: 'PRINCIPAL' },
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    })

    if (!school) {
      console.log('❌ School not found in database')
      return
    }

    console.log('✅ School found:')
    console.log('Name:', school.name)
    console.log('Clerk Organization ID:', school.clerkOrganizationId || 'NOT SET')
    console.log('City, State:', school.city, school.state)
    console.log('Principals:', school.users.length > 0 ? school.users : 'None found')
    
    if (!school.clerkOrganizationId) {
      console.log('\n🚨 ISSUE FOUND: School has no Clerk organization ID')
      console.log('This means the school was created without Clerk integration')
      console.log('\n💡 SOLUTION: The principal needs to re-create the school or we need to fix the integration')
    } else {
      console.log('\n📝 Clerk Organization ID exists:', school.clerkOrganizationId)
      console.log('This ID should be validated with Clerk API')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSchool()
