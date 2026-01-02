"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  // Extract password from form data
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validate passwords
  if (!password || password.trim() === "") {
    throw new Error("Password is required")
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long")
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords don't match")
  }

  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error("Error updating password:", error)
    throw new Error("Failed to update password. Please try again.")
  }

  // Redirect to login page with success message
  redirect("/login?message=password-reset-success")
}
