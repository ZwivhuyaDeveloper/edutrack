import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a sample school
  const school = await prisma.school.create({
    data: {
      name: 'EduTrack Demo School',
      address: '123 Education Street',
      city: 'Demo City',
      state: 'DC',
      zipCode: '12345',
      country: 'US',
      phone: '+1-555-0123',
      email: 'info@edutrackdemoschool.edu',
      website: 'https://edutrackdemoschool.edu',
    }
  })

  console.log('✅ Created school:', school.name)

  // Create sample subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Basic Mathematics',
        schoolId: school.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'English Language Arts',
        code: 'ELA101',
        description: 'English Language and Literature',
        schoolId: school.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Science',
        code: 'SCI101',
        description: 'General Science',
        schoolId: school.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'History',
        code: 'HIST101',
        description: 'World History',
        schoolId: school.id
      }
    })
  ])

  console.log('✅ Created subjects:', subjects.length)

  // Create sample classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Grade 9A',
        grade: '9',
        section: 'A',
        schoolId: school.id
      }
    }),
    prisma.class.create({
      data: {
        name: 'Grade 10A',
        grade: '10',
        section: 'A',
        schoolId: school.id
      }
    }),
    prisma.class.create({
      data: {
        name: 'Grade 11A',
        grade: '11',
        section: 'A',
        schoolId: school.id
      }
    })
  ])

  console.log('✅ Created classes:', classes.length)

  // Create a sample term
  const term = await prisma.term.create({
    data: {
      name: 'Fall 2024',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      isActive: true,
      schoolId: school.id
    }
  })

  console.log('✅ Created term:', term.name)

  console.log('🎉 Database seeded successfully!')
  console.log('\n📋 Sample Data Created:')
  console.log(`- School: ${school.name}`)
  console.log(`- Subjects: ${subjects.length}`)
  console.log(`- Classes: ${classes.length}`)
  console.log(`- Term: ${term.name}`)
  console.log('\n💡 Next steps:')
  console.log('1. Set up your Clerk account and add the environment variables')
  console.log('2. Register users through the application')
  console.log('3. Assign users to classes and subjects as needed')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

