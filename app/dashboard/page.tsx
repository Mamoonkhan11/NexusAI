import { Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getCurrentUserProfile } from "@/lib/supabase/getCurrentUserProfile"

export default async function DashboardPage() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile) {
    return (
      <DashboardLayout user={null}>
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center size-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-2xl shadow-cyan-500/30 mb-2">
              <Zap className="size-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white text-balance">Welcome to Brainlyx AI</h1>
            <p className="text-base text-slate-300 text-balance max-w-md mx-auto">
              Your intelligent workspace for AI-powered productivity. Get started by exploring the sidebar or jump into AI
              Chat.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={userProfile}>
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center size-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-2xl shadow-cyan-500/30 mb-2">
            <Zap className="size-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white text-balance">
            Hello, {userProfile.fullName || userProfile.email.split('@')[0]}!
          </h1>
          <p className="text-base text-slate-300 text-balance max-w-md mx-auto">
            Your intelligent workspace for AI-powered productivity. Get started by exploring the sidebar or jump into AI
            Chat.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
