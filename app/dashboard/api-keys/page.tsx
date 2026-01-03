import { Suspense } from "react"
import { getCurrentUserProfile } from "@/lib/supabase/getCurrentUserProfile"
import { ApiKeysPageClient } from "./api-keys-client"

export default async function ApiKeysPage() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6">
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400">You must be logged in to access API keys.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApiKeysPageClient />
    </Suspense>
  )
}
