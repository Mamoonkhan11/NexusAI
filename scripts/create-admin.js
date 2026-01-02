#!/usr/bin/env node

/**
 * Create Admin User Script
 *
 * This script helps you create or update a user to have admin privileges.
 * Run this after setting up your Supabase project and having users registered.
 */

const { createClient } = require('@supabase/supabase-js')

async function createAdminUser(email) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local')
    console.log('Please set:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url')
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    console.log(`🔍 Looking for user with email: ${email}`)

    // First, find the user by email
    const { data: users, error: findError } = await supabase.auth.admin.listUsers()

    if (findError) {
      console.error('❌ Error fetching users:', findError.message)
      process.exit(1)
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ User with email ${email} not found.`)
      console.log('Available users:')
      users.users.forEach(u => console.log(`  - ${u.email} (ID: ${u.id})`))
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)

    // Update user metadata to add admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin'
      },
      // Also update raw_user_meta_data which is the correct field for admin updates
      raw_user_meta_data: {
        ...user.raw_user_meta_data,
        role: 'admin'
      }
    })

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message)
      process.exit(1)
    }

    console.log(`✅ Successfully granted admin role to ${email}`)
    console.log(`🔐 Admin user can now access /admin-login`)

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

// Check if email is provided as argument
const email = process.argv[2]
if (!email) {
  console.log('📋 Usage: node scripts/create-admin.js <email>')
  console.log('📧 Example: node scripts/create-admin.js admin@example.com')
  console.log('')
  console.log('This script will grant admin privileges to the specified user.')
  process.exit(1)
}

createAdminUser(email)
