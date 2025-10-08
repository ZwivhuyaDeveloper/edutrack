const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addClerkOrgColumn() {
  try {
    console.log('🔧 Adding clerkOrganizationId column to schools table...')
    
    // Check if column already exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'schools' 
      AND column_name = 'clerkOrganizationId'
    `
    
    if (result.length > 0) {
      console.log('✅ Column clerkOrganizationId already exists')
      return
    }
    
    // Add the column
    await prisma.$executeRaw`
      ALTER TABLE schools 
      ADD COLUMN "clerkOrganizationId" TEXT
    `
    
    // Add unique constraint
    await prisma.$executeRaw`
      ALTER TABLE schools 
      ADD CONSTRAINT schools_clerkOrganizationId_key 
      UNIQUE ("clerkOrganizationId")
    `
    
    console.log('✅ Successfully added clerkOrganizationId column with unique constraint')
    
  } catch (error) {
    console.error('❌ Error adding column:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addClerkOrgColumn()
