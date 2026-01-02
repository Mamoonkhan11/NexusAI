"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()

  // Extract email from form data
  const email = formData.get("email") as string

  // Validate email
  if (!email || email.trim() === "") {
    throw new Error("Email is required")
  }

  // Validate email format (basic check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address")
  }

  // Send password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    console.error("Error sending password reset email:", error)
    throw new Error("Failed to send password reset email. Please try again.")
  }

  // Don't redirect - let the client show success state
  // The page will show "Check your email" message
}
