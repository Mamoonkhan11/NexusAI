import { createClient } from "@/lib/supabase/server"

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting user:", error)
    return null
  }

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    fullName: user.user_metadata?.name,
    avatarUrl: user.user_metadata?.avatar_url,
  }
}
