#!/usr/bin/env node

/**
 * EduTrack MVP Verification Script
 * Checks if the application is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying EduTrack MVP...\n');

const checks = [];
let passed = 0;
let failed = 0;

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

// Helper function to check if directory exists
function dirExists(dirPath) {
  return fs.existsSync(path.join(__dirname, '..', dirPath));
}

// Check 1: Essential files
console.log('📁 Checking essential files...');
const essentialFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'prisma/schema.prisma',
  '.env.example',
];

essentialFiles.forEach(file => {
  const exists = fileExists(file);
  checks.push({ name: `File: ${file}`, status: exists });
  if (exists) {
    console.log(`  ✅ ${file}`);
    passed++;
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    failed++;
  }
});

// Check 2: Dashboard structure
console.log('\n📊 Checking dashboard structure...');
const dashboards = [
  'src/app/dashboard/principal',
  'src/app/dashboard/teacher',
  'src/app/dashboard/learner',
  'src/app/dashboard/parent',
];

dashboards.forEach(dir => {
  const exists = dirExists(dir);
  checks.push({ name: `Dashboard: ${dir}`, status: exists });
  if (exists) {
    console.log(`  ✅ ${dir}`);
    passed++;
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
    failed++;
  }
});

// Check 3: Principal dashboard pages
console.log('\n🏫 Checking principal dashboard pages...');
const principalPages = [
  'src/app/dashboard/principal/home/page.tsx',
  'src/app/dashboard/principal/people/page.tsx',
  'src/app/dashboard/principal/academic/page.tsx',
  'src/app/dashboard/principal/operations/page.tsx',
  'src/app/dashboard/principal/communication/page.tsx',
  'src/app/dashboard/principal/events/page.tsx',
  'src/app/dashboard/principal/finance/page.tsx',
  'src/app/dashboard/principal/settings/page.tsx',
];

principalPages.forEach(page => {
  const exists = fileExists(page);
  checks.push({ name: `Principal page: ${path.basename(path.dirname(page))}`, status: exists });
  if (exists) {
    console.log(`  ✅ ${path.basename(path.dirname(page))}`);
    passed++;
  } else {
    console.log(`  ❌ ${path.basename(path.dirname(page))} - MISSING`);
    failed++;
  }
});

// Check 4: Core components
console.log('\n🧩 Checking core components...');
const coreComponents = [
  'src/components/app-sidebar.tsx',
  'src/components/nav-main.tsx',
  'src/components/dashboard-skeleton.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
];

coreComponents.forEach(component => {
  const exists = fileExists(component);
  checks.push({ name: `Component: ${path.basename(component)}`, status: exists });
  if (exists) {
    console.log(`  ✅ ${path.basename(component)}`);
    passed++;
  } else {
    console.log(`  ❌ ${path.basename(component)} - MISSING`);
    failed++;
  }
});

// Check 5: Authentication pages
console.log('\n🔐 Checking authentication pages...');
const authPages = [
  'src/app/sign-in/[[...sign-in]]/page.tsx',
  'src/app/sign-up/[[...sign-up]]/page.tsx',
];

authPages.forEach(page => {
  const exists = fileExists(page);
  checks.push({ name: `Auth page: ${page}`, status: exists });
  if (exists) {
    console.log(`  ✅ ${page}`);
    passed++;
  } else {
    console.log(`  ❌ ${page} - MISSING`);
    failed++;
  }
});

// Check 6: API routes
console.log('\n🔌 Checking API routes...');
const apiRoutes = [
  'src/app/api/users/me/route.ts',
];

apiRoutes.forEach(route => {
  const exists = fileExists(route);
  checks.push({ name: `API: ${route}`, status: exists });
  if (exists) {
    console.log(`  ✅ ${route}`);
    passed++;
  } else {
    console.log(`  ⚠️  ${route} - MISSING (optional)`);
  }
});

// Check 7: Environment variables
console.log('\n🔧 Checking environment setup...');
const envExample = fileExists('.env.example');
const envLocal = fileExists('.env.local');

if (envExample) {
  console.log('  ✅ .env.example exists');
  passed++;
} else {
  console.log('  ❌ .env.example - MISSING');
  failed++;
}

if (envLocal) {
  console.log('  ✅ .env.local exists');
  passed++;
} else {
  console.log('  ⚠️  .env.local - MISSING (create from .env.example)');
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📝 Total checks: ${passed + failed}`);

const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
console.log(`\n🎯 Success Rate: ${successRate}%`);

if (failed === 0) {
  console.log('\n🎉 SUCCESS! Your MVP is ready for deployment!');
  console.log('\n📚 Next steps:');
  console.log('  1. Set up .env.local with your credentials');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npx prisma generate');
  console.log('  4. Run: npx prisma migrate deploy');
  console.log('  5. Run: npm run build');
  console.log('  6. Deploy to Vercel: vercel --prod');
  console.log('\n📖 See MVP_DEPLOYMENT_GUIDE.md for detailed instructions');
  process.exit(0);
} else if (failed <= 3) {
  console.log('\n⚠️  ALMOST READY! Fix the missing items above.');
  console.log('   Most issues are likely optional or can be quickly resolved.');
  process.exit(1);
} else {
  console.log('\n❌ NOT READY! Several critical files are missing.');
  console.log('   Please review the checklist above and ensure all files exist.');
  process.exit(1);
}
