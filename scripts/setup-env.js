#!/usr/bin/env node

/**
 * Environment Setup Script
 *
 * This script helps you set up your .env.local file for Brainlyx AI.
 */

const fs = require('fs')
const path = require('path')

const envLocalPath = path.join(__dirname, '..', '.env.local')
const envTemplatePath = path.join(__dirname, '..', '.env.template')

console.log('🔧 Brainlyx AI Environment Setup')
console.log('============================\n')

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists!')
  console.log('   To recreate it, delete the existing file first.')
  console.log('   Current location:', envLocalPath)
  process.exit(0)
}

// Create .env.local with basic template
const envContent = `# Brainlyx AI Environment Configuration
# Fill in your actual values below

# ===========================================
# SUPABASE CONFIGURATION (Required)
# ===========================================
# Get these from https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ===========================================
# AI API KEYS (Optional - for full functionality)
# ===========================================
# OpenAI - https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key

# Google Gemini - https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key

# Anthropic Claude - https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Groq - https://console.groq.com/keys
GROQ_API_KEY=gsk_your-groq-api-key

# ===========================================
# DEVELOPMENT CONFIGURATION
# ===========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# OPTIONAL FEATURES
# ===========================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_FEEDBACK=true

# ===========================================
# SECURITY (Generate a random string)
# ===========================================
JWT_SECRET=your-random-jwt-secret-here

# ===========================================
# MONITORING
# ===========================================
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
`

try {
  fs.writeFileSync(envLocalPath, envContent, 'utf8')
  console.log('✅ Created .env.local file!')
  console.log('📝 Location:', envLocalPath)
  console.log('')
  console.log('📋 Next Steps:')
  console.log('1. Open .env.local in your editor')
  console.log('2. Fill in your Supabase credentials')
  console.log('3. Add your AI API keys (optional)')
  console.log('4. Run: npm run setup')
  console.log('5. Run: npm run dev')
  console.log('')
  console.log('🔗 Get Supabase credentials:')
  console.log('   https://supabase.com/dashboard')
  console.log('')
  console.log('🔑 Get AI API keys:')
  console.log('   • OpenAI: https://platform.openai.com/api-keys')
  console.log('   • Google: https://makersuite.google.com/app/apikey')
  console.log('   • Anthropic: https://console.anthropic.com/')
  console.log('   • Groq: https://console.groq.com/keys')

} catch (error) {
  console.error('❌ Error creating .env.local:', error.message)
  process.exit(1)
}
