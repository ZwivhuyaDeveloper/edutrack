// Test database connection
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'info', 'warn'],
  })

  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Successfully connected to database')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', result)
    
    // Check if User table exists
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ User table exists with ${userCount} records`)
    } catch (error) {
      console.log('❌ User table not found or not accessible:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.message.includes('Server has closed the connection')) {
      console.log('\n🔍 Troubleshooting tips:')
      console.log('1. Check if your database service is running')
      console.log('2. Verify DATABASE_URL is correct')
      console.log('3. Check network connectivity to database host')
      console.log('4. Verify database credentials')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
