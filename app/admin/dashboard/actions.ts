"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function adminLogout() {
  const supabase = await createClient()

  // Sign out the user
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
  }

  // Redirect to admin login page
  redirect("/admin-login")
}
