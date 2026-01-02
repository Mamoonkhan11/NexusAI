"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract email and password from form data
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate inputs
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // Attempt to sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Handle error
  if (error) {
    return { error: error.message }
  }

  // On success, redirect to dashboard
  redirect("/dashboard")
}
