"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function adminLogin(formData: FormData) {
  // Extract email and password from form data
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate inputs
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  console.log("🔐 Attempting admin login for:", email)
  console.log("🔑 Password provided:", !!password)

  const supabase = await createClient()
  console.log("✅ Supabase client created successfully")

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("📊 Supabase auth result:", {
    hasData: !!data,
    hasUser: !!data?.user,
    userEmail: data?.user?.email,
    error: error?.message,
    errorCode: error?.status
  })

  // Handle error
  if (error) {
    console.error("❌ Admin login error:", error)
    console.error("❌ Error details:", {
      message: error.message,
      status: error.status,
      name: error.name
    })
    return { error: `Authentication failed: ${error.message}` }
  }

  // Verify user has admin role by querying the database directly
  const user = data.user
  if (!user?.id) {
    await supabase.auth.signOut()
    return { error: "Authentication failed." }
  }

  // Check if user has admin role in user metadata
  const userRole = user.user_metadata?.role

  console.log("User role check:", {
    userId: user.id,
    userRole: userRole
  })

  if (!userRole || userRole !== "admin") {
    console.log("Access denied: User does not have admin role", {
      userId: user.id,
      userRole: userRole
    })
    await supabase.auth.signOut()
    return { error: "Access denied. Admin privileges required." }
  }

  console.log("Admin access granted for user:", user.email)

  // Redirect to admin dashboard on success
  redirect('/admin/dashboard')
}
