const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPrincipalProfile() {
  try {
    console.log('🔍 Checking Principal Profile data...\n')
    
    // Find all principals
    const principals = await prisma.user.findMany({
      where: { role: 'PRINCIPAL' },
      include: {
        principalProfile: true,
        clerkProfile: true,
        school: {
          select: {
            name: true,
            city: true,
            state: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${principals.length} principal(s):\n`)
    
    principals.forEach((principal, index) => {
      console.log(`${index + 1}. Principal: ${principal.firstName} ${principal.lastName}`)
      console.log(`   Email: ${principal.email}`)
      console.log(`   School: ${principal.school?.name || 'No school assigned'}`)
      console.log(`   Active: ${principal.isActive ? 'Yes' : 'No'}`)
      console.log(`   Created: ${principal.createdAt.toISOString()}`)
      
      // Check Principal Profile
      if (principal.principalProfile) {
        console.log('   ✅ Principal Profile EXISTS:')
        console.log(`      Employee ID: ${principal.principalProfile.employeeId || 'Not set'}`)
        console.log(`      Phone: ${principal.principalProfile.phone || 'Not set'}`)
        console.log(`      Address: ${principal.principalProfile.address || 'Not set'}`)
        console.log(`      Emergency Contact: ${principal.principalProfile.emergencyContact || 'Not set'}`)
        console.log(`      Qualifications: ${principal.principalProfile.qualifications || 'Not set'}`)
        console.log(`      Years of Experience: ${principal.principalProfile.yearsOfExperience || 'Not set'}`)
        console.log(`      Previous School: ${principal.principalProfile.previousSchool || 'Not set'}`)
        console.log(`      Education Background: ${principal.principalProfile.educationBackground || 'Not set'}`)
        console.log(`      Salary: ${principal.principalProfile.salary || 'Not set'}`)
        console.log(`      Administrative Area: ${principal.principalProfile.administrativeArea || 'Not set'}`)
      } else {
        console.log('   ❌ Principal Profile MISSING')
      }
      
      // Check Clerk Profile
      if (principal.clerkProfile) {
        console.log('   ✅ Clerk Profile EXISTS:')
        console.log(`      Employee ID: ${principal.clerkProfile.employeeId || 'Not set'}`)
        console.log(`      Department: ${principal.clerkProfile.department || 'Not set'}`)
        console.log(`      Phone: ${principal.clerkProfile.phone || 'Not set'}`)
        console.log(`      Address: ${principal.clerkProfile.address || 'Not set'}`)
      } else {
        console.log('   ❌ Clerk Profile MISSING')
      }
      
      console.log('')
    })
    
    if (principals.length === 0) {
      console.log('ℹ️  No principals found in database')
    }
    
  } catch (error) {
    console.error('❌ Error checking principal profiles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrincipalProfile()
