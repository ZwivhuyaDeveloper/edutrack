const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function simpleCheck() {
  try {
    // Check schools
    const schoolCount = await prisma.school.count()
    console.log('Total schools:', schoolCount)
    
    const schoolsWithClerkOrg = await prisma.school.count({
      where: {
        clerkOrganizationId: {
          not: null
        }
      }
    })
    console.log('Schools with Clerk Org ID:', schoolsWithClerkOrg)
    
    // Check users
    const userCount = await prisma.user.count()
    console.log('Total users:', userCount)
    
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    })
    console.log('Active users:', activeUsers)
    
    // Check by role
    const principals = await prisma.user.count({
      where: { role: 'PRINCIPAL' }
    })
    console.log('Principals:', principals)
    
    const teachers = await prisma.user.count({
      where: { role: 'TEACHER' }
    })
    console.log('Teachers:', teachers)
    
    const students = await prisma.user.count({
      where: { role: 'STUDENT' }
    })
    console.log('Students:', students)
    
    const parents = await prisma.user.count({
      where: { role: 'PARENT' }
    })
    console.log('Parents:', parents)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simpleCheck()
