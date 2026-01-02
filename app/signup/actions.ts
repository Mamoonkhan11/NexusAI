"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Extract form data
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validate inputs
  if (!name || !email || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return { error: "Passwords don't match" }
  }

  // Attempt to sign up with user metadata
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name.trim(),
      }
    }
  })

  // Handle error
  if (error) {
    return { error: error.message }
  }

  // On success, redirect to dashboard
  redirect("/dashboard")
}
