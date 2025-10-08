const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUserCreation() {
  try {
    console.log('🧪 Testing User Creation Logic...\n')
    
    // Simulate the exact data structure sent from setup-school form
    const testData = {
      role: 'PRINCIPAL',
      schoolId: 'test-school-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testschool.com',
      principalProfile: {
        employeeId: 'EMP001',
        hireDate: '2024-01-15',
        phone: '+1234567890',
        address: '123 Main St, City, State',
        emergencyContact: 'Jane Doe - +0987654321',
        qualifications: 'PhD in Education, Masters in Administration',
        yearsOfExperience: 15,
        previousSchool: 'Previous High School',
        educationBackground: 'Harvard University - PhD Education',
        salary: 75000,
        administrativeArea: 'Academic Affairs',
      }
    }
    
    console.log('📋 Test Data Structure:')
    console.log(JSON.stringify(testData, null, 2))
    console.log('')
    
    // Test validation schema
    console.log('🔍 Testing Validation Schema...')
    
    // Import the validation schema (simulate)
    const { z } = require('zod')
    
    const createUserSchema = z.object({
      role: z.enum(['STUDENT', 'TEACHER', 'PARENT', 'PRINCIPAL']),
      schoolId: z.string().min(1, 'School is required'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email address'),
      principalProfile: z.object({
        employeeId: z.string().optional(),
        hireDate: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        emergencyContact: z.string().optional(),
        qualifications: z.string().optional(),
        yearsOfExperience: z.number().int().positive().optional(),
        previousSchool: z.string().optional(),
        educationBackground: z.string().optional(),
        salary: z.number().positive().optional(),
        administrativeArea: z.string().optional(),
      }).optional(),
    })
    
    try {
      const validatedData = createUserSchema.parse(testData)
      console.log('✅ Validation passed!')
      console.log('📊 Validated Principal Profile Data:')
      console.log(JSON.stringify(validatedData.principalProfile, null, 2))
      
      // Check what would be saved to database
      console.log('\n🗄️ Data that would be saved to PrincipalProfile:')
      const principalProfileData = {
        employeeId: validatedData.principalProfile?.employeeId || null,
        hireDate: validatedData.principalProfile?.hireDate ? new Date(validatedData.principalProfile.hireDate) : null,
        phone: validatedData.principalProfile?.phone || null,
        address: validatedData.principalProfile?.address || null,
        emergencyContact: validatedData.principalProfile?.emergencyContact || null,
        qualifications: validatedData.principalProfile?.qualifications || null,
        yearsOfExperience: validatedData.principalProfile?.yearsOfExperience || null,
        previousSchool: validatedData.principalProfile?.previousSchool || null,
        educationBackground: validatedData.principalProfile?.educationBackground || null,
        salary: validatedData.principalProfile?.salary || null,
        administrativeArea: validatedData.principalProfile?.administrativeArea || null,
      }
      
      console.log(JSON.stringify(principalProfileData, null, 2))
      
      // Check ClerkProfile data
      console.log('\n🏢 Data that would be saved to ClerkProfile:')
      const clerkProfileData = {
        employeeId: validatedData.principalProfile?.employeeId || null,
        department: null, // Not provided in principal data
        hireDate: validatedData.principalProfile?.hireDate ? new Date(validatedData.principalProfile.hireDate) : null,
        phone: validatedData.principalProfile?.phone || null,
        address: validatedData.principalProfile?.address || null,
      }
      
      console.log(JSON.stringify(clerkProfileData, null, 2))
      
    } catch (validationError) {
      console.error('❌ Validation failed:', validationError.errors)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserCreation()
