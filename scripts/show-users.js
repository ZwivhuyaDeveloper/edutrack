const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        school: {
          select: {
            name: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n📊 Found ${users.length} user(s) in database:\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User Details:`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ClerkID: ${user.clerkId || '(empty)'}`)
      console.log(`   School: ${user.school.name} (${user.school.city}, ${user.school.state})`)
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`)
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log(`   Updated: ${user.updatedAt.toISOString()}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showUsers()
