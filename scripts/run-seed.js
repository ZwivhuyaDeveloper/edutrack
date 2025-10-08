#!/usr/bin/env node

/**
 * Script to run the contextual database seed
 * This script will analyze existing data and create appropriate mock data
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Running contextual database seed...\n');

try {
  // Change to the project root directory
  process.chdir(path.resolve(__dirname, '..'));
  
  // Run the seed script
  execSync('npx tsx prisma/seed.ts', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ Seed completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Check your database to verify the created data');
  console.log('2. Update Clerk IDs as users register through the app');
  console.log('3. Start your development server: npm run dev');
  
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}
