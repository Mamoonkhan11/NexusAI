#!/usr/bin/env node

/**
 * Admin Setup Helper Script
 *
 * This script helps you set up admin access for the Brainlyx AI application.
 * It checks for environment variables and provides instructions for creating admin users.
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Brainlyx AI Admin Setup Helper')
console.log('==============================\n')

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local')
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log('❌ .env.local file not found!')
  console.log('📝 Please create a .env.local file in the root directory with:')
  console.log('')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key')
  console.log('')
  console.log('🔗 Get these values from your Supabase project dashboard.')
  console.log('')
  process.exit(1)
}

// Load environment variables
require('dotenv').config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.log('❌ Missing Supabase credentials in .env.local')
  console.log('📝 Please ensure you have:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key')
  process.exit(1)
}

console.log('✅ Environment variables found!')
console.log('🔍 Checking for existing users...\n')

// Check for users
async function checkUsers() {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.log('❌ Error fetching users:', error.message)
      console.log('💡 Make sure your Supabase project is set up correctly.')
      process.exit(1)
    }

    const users = data.users || []

    if (users.length === 0) {
      console.log('📝 No users found in your Supabase project.')
      console.log('')
      console.log('🚀 To create an admin user:')
      console.log('1. Register a user account at http://localhost:3000/signup')
      console.log('2. Then run: npm run create-admin your-email@example.com')
      console.log('')
      console.log('📧 Replace "your-email@example.com" with the email you used to sign up.')
      process.exit(0)
    }

    console.log(`✅ Found ${users.length} user(s):`)
    users.forEach(user => {
      const isAdmin = user.user_metadata?.role === 'admin' || user.raw_user_meta_data?.role === 'admin'
      console.log(`  - ${user.email} ${isAdmin ? '(ADMIN)' : ''}`)
    })

    const adminUsers = users.filter(user =>
      user.user_metadata?.role === 'admin' || user.raw_user_meta_data?.role === 'admin'
    )

    if (adminUsers.length > 0) {
      console.log('')
      console.log('🎉 Admin users already exist!')
      console.log('🔐 You can now login at: http://localhost:3000/admin-login')
      console.log('📧 Admin emails:', adminUsers.map(u => u.email).join(', '))
    } else {
      console.log('')
      console.log('⚠️  No admin users found.')
      console.log('')
      console.log('🚀 To create an admin user, choose one of these options:')
      console.log('')
      console.log('📋 Option 1: Use the automated script')
      console.log('   Run: npm run create-admin your-email@example.com')
      console.log('   (Replace with one of the emails above)')
      console.log('')
      console.log('📋 Option 2: Manual SQL query in Supabase SQL Editor')
      console.log('   UPDATE auth.users')
      console.log('   SET raw_user_meta_data = COALESCE(raw_user_meta_data, \'{}\')::jsonb || \'{"role": "admin"}\'::jsonb')
      console.log('   WHERE email = \'your-email@example.com\';')
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('💡 Make sure your Supabase credentials are correct.')
    process.exit(1)
  }
}

checkUsers()
