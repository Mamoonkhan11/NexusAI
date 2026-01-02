import { User, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUserProfile } from "@/lib/supabase/getCurrentUserProfile"
import { updateProfile } from "./actions"
import { SettingsPageClient } from "./settings-client"

export default async function SettingsPage() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6">
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400">You must be logged in to access settings.</p>
          </div>
        </div>
      </div>
    )
  }

  return <SettingsPageClient userProfile={userProfile} />
}
