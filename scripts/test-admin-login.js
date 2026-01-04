#!/usr/bin/env node

/**
 * Test Admin Login Script
 *
 * This script tests if the admin login works with the default credentials.
 */

const { createClient } = require('@supabase/supabase-js')

async function testAdminLogin() {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local')
    console.log('Please set:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const adminEmail = 'admin@Brainlyx AI.com'
  const adminPassword = 'admin@Brainlyx AI'

  console.log('🧪 Testing admin login...')
  console.log(`📧 Email: ${adminEmail}`)
  console.log(`🔑 Password: ${adminPassword}`)
  console.log('')

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (error) {
      console.log('❌ Login failed:', error.message)
      console.log('🔍 Error details:', error)

      // Check if user exists
      console.log('')
      console.log('🔍 Checking if user exists...')
      const serviceSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
      const { data: users, error: userError } = await serviceSupabase.auth.admin.listUsers()

      if (userError) {
        console.log('❌ Could not check users:', userError.message)
      } else {
        const user = users.users.find(u => u.email === adminEmail)
        if (user) {
          console.log('✅ User exists:', user.email)
          console.log('🔐 User confirmed:', user.email_confirmed_at ? 'Yes' : 'No')
          console.log('👤 User metadata:', user.user_metadata)
          console.log('📋 Raw user metadata:', user.raw_user_meta_data)

          // Try to update password
          console.log('')
          console.log('🔧 Attempting to reset password...')

          const newPassword = 'admin123456'
          const { error: updateError } = await serviceSupabase.auth.admin.updateUserById(user.id, {
            password: newPassword
          })

          if (updateError) {
            console.log('❌ Password reset failed:', updateError.message)
          } else {
            console.log('✅ Password reset successful!')
            console.log(`🔑 New password: ${newPassword}`)
          }
        } else {
          console.log('❌ User does not exist')
        }
      }
    } else {
      console.log('✅ Login successful!')
      console.log('👤 User:', data.user?.email)
      console.log('🔐 User metadata:', data.user?.user_metadata)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testAdminLogin()
