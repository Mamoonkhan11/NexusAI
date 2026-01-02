#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script helps you set up the database tables for NexusAI.
 * Run this after setting up your Supabase project.
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 NexusAI Database Setup')
console.log('==========================\n')

console.log('📋 Required Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key')
console.log('SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key\n')

console.log('📁 SQL Migrations to run in Supabase SQL Editor:')
console.log('================================================\n')

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

try {
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()

  files.forEach((file, index) => {
    const filePath = path.join(migrationsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')

    console.log(`${index + 1}. ${file}`)
    console.log('─'.repeat(file.length + 2))
    console.log(content.trim())
    console.log('\n' + '='.repeat(50) + '\n')
  })

  console.log('✅ Setup Complete!')
  console.log('\n📝 Next Steps:')
  console.log('1. Create your Supabase project')
  console.log('2. Copy the credentials to .env.local')
  console.log('3. Run the SQL migrations above in Supabase SQL Editor')
  console.log('4. Create an admin user with the SQL command shown in README.md')
  console.log('5. Start the app with: npm run dev')

} catch (error) {
  console.error('❌ Error reading migrations:', error.message)
  process.exit(1)
}
