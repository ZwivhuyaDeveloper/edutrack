const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDemoSchool() {
  try {
    console.log('Creating demo school...')
    
    const school = await prisma.school.create({
      data: {
        name: 'EduTrack Demo Academy',
        address: '123 Education Street',
        city: 'Learning City',
        state: 'LC',
        zipCode: '12345',
        phone: '+1-555-0100',
        email: 'admin@edutrackdemo.edu',
        website: 'https://edutrackdemo.edu',
        clerkOrganizationId: 'demo_org_' + Date.now()
      }
    })
    
    console.log('✅ Demo school created:', school.name)
    console.log('School ID:', school.id)
    
  } catch (error) {
    console.error('❌ Error creating demo school:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoSchool()
