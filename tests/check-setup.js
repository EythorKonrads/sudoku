#!/usr/bin/env node

/**
 * Pre-flight check script to verify environment setup before running tests
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment setup...\n');

// Check for .env files
const envFiles = ['.env.local', '.env'];
const existingEnvFiles = envFiles.filter(file => 
  fs.existsSync(path.join(__dirname, '..', file))
);

if (existingEnvFiles.length === 0) {
  console.error('❌ No .env files found!');
  console.error('   Create a .env.local file with:');
  console.error('   - DATABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
  process.exit(1);
} else {
  console.log(`✅ Found environment files: ${existingEnvFiles.join(', ')}`);
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Check required variables
const requiredVars = {
  'DATABASE_URL': 'Database connection string',
};

const optionalVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
};

let missingRequired = false;

console.log('\n📋 Required environment variables:');
for (const [varName, description] of Object.entries(requiredVars)) {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing (${description})`);
    missingRequired = true;
  }
}

console.log('\n📋 Optional environment variables:');
for (const [varName, description] of Object.entries(optionalVars)) {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`⚠️  ${varName}: Missing (${description})`);
  }
}

// Check for Prisma client
const prismaClientPath = path.join(__dirname, '..', 'src', 'generated', 'prisma');
if (fs.existsSync(prismaClientPath)) {
  console.log('\n✅ Prisma client is generated');
} else {
  console.log('\n⚠️  Prisma client not found. Run: npx prisma generate');
}

// Check for node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Dependencies are installed');
} else {
  console.log('❌ Dependencies not installed. Run: npm install');
  process.exit(1);
}

console.log('\n');

if (missingRequired) {
  console.error('❌ Missing required environment variables. Please configure your .env.local file.\n');
  process.exit(1);
} else {
  console.log('✅ Environment setup looks good! You can run the tests with: npm run test:e2e\n');
}
