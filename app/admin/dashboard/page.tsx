import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Activity,
  MessageSquare,
  TrendingUp,
  Shield,
  LogOut,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  ShieldCheck
} from "lucide-react"
import { format } from "date-fns"
import { adminLogout } from "./actions"
import AdminUserManagement from "@/components/admin-user-management"
import { redirect } from "next/navigation"

// Verify admin access at page level
async function verifyAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin-login')
  }

  if (user.user_metadata?.role !== "admin") {
    redirect('/?unauthorized=1')
  }

  console.log("Admin dashboard access granted for user:", user.email, { role: user.user_metadata?.role })
  return user
}

// Client component for logout functionality
function LogoutButton() {
  return (
    <form action={adminLogout}>
      <Button
        type="submit"
        variant="outline"
        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  )
}

// Server components for data fetching
async function StatsCards() {
  let totalUsers = 0
  let activeUsers = 0
  let apiCallsPerMinute = 0
  let totalFeedback = 0

  try {
    const supabase = await createAdminClient()

    // Fetch users using admin API
    try {
      const { data, error: usersError } = await supabase.auth.admin.listUsers()
      if (!usersError && data?.users && Array.isArray(data.users)) {
        totalUsers = data.users.length
        // Count active users (users who signed in within the last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        activeUsers = data.users.filter(user =>
          user.last_sign_in_at && new Date(user.last_sign_in_at) > oneDayAgo
        ).length
        console.log('StatsCards: Found', totalUsers, 'total users,', activeUsers, 'active users')
      } else {
        console.error('StatsCards: Error fetching users:', usersError)
        totalUsers = 0
        activeUsers = 0
      }
    } catch (error) {
      console.error('StatsCards: Failed to fetch users:', error)
      totalUsers = 0
      activeUsers = 0
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count: apiCount } = await supabase
      .from('api_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneMinuteAgo)
    apiCallsPerMinute = apiCount || 0

    const { count: feedbackCount } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact', head: true })
    totalFeedback = feedbackCount || 0

    console.log('StatsCards: API calls per minute:', apiCallsPerMinute, 'Total feedback:', totalFeedback)
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Keep default values (0) for unconfigured systems
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card className="bg-slate-800/50 border-slate-700 shadow-lg shadow-slate-900/40 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
          <Users className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold text-white">{totalUsers || 0}</div>
          <p className="text-xs text-slate-400">Registered users</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 shadow-lg shadow-slate-900/40 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-medium text-slate-200">Active Users</CardTitle>
          <Activity className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold text-white">{activeUsers || 0}</div>
          <p className="text-xs text-slate-400">Active in last 24h</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 shadow-lg shadow-slate-900/40 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-medium text-slate-200">API Calls/Min</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold text-white">{apiCallsPerMinute || 0}</div>
          <p className="text-xs text-slate-400">Last minute</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 shadow-lg shadow-slate-900/40 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-medium text-slate-200">Total Feedback</CardTitle>
          <MessageSquare className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold text-white">{totalFeedback || 0}</div>
          <p className="text-xs text-slate-400">User submissions</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function FeedbackSection() {
  let feedback: any[] = []

  try {
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    feedback = data || []
  } catch (error) {
    console.error('Error fetching feedback:', error)
    feedback = []
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-lg shadow-slate-900/40 rounded-2xl">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Recent Feedback
        </CardTitle>
        <CardDescription className="text-slate-400">Latest user feedback submissions</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-4">
          {feedback && feedback.length > 0 ? (
            feedback.map((item) => (
              <div key={item.id} className="border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{item.name || 'Anonymous'}</span>
                    <span className="text-xs text-slate-400">{item.email || 'No email'}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {format(new Date(item.created_at), 'MMM d, HH:mm')}
                  </span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{item.message}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No feedback yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


async function ApiLogsSection() {
  const providerCounts: Record<string, number> = {}
  let totalApiCalls = 0
  let timeRange = "last hour"
  let logs: Array<{ provider: string; created_at: string }> | null = null

  try {
    const supabase = await createAdminClient()

    // Try last hour first
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    console.log('ApiLogsSection: Querying api_logs from:', oneHourAgo)
    
    const { data: logsData, error: logsError } = await supabase
      .from('api_logs')
      .select('provider, created_at')
      .gte('created_at', oneHourAgo)
    
    logs = logsData
    
    console.log('ApiLogsSection: Query result:', { 
      logsCount: logs?.length || 0, 
      error: logsError?.message || null,
      sampleLog: logs?.[0] || null
    })

    if (logsError) {
      console.error('Error fetching API logs:', logsError)
      // Try last 24 hours as fallback
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: logsDay, error: logsDayError } = await supabase
        .from('api_logs')
        .select('provider, created_at')
        .gte('created_at', oneDayAgo)

      if (logsDayError) {
        console.error('Error fetching API logs (24h):', logsDayError)
      } else {
        logs = logsDay
        timeRange = "last 24 hours"
      }
    } else if (!logs || logs.length === 0) {
      // If no logs in last hour, try last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: logsDay } = await supabase
        .from('api_logs')
        .select('provider, created_at')
        .gte('created_at', oneDayAgo)

      if (logsDay && logsDay.length > 0) {
        logs = logsDay
        timeRange = "last 24 hours"
      }
    }

    console.log(`API Logs: Found ${logs?.length || 0} logs in ${timeRange}`)

    // Count by provider
    logs?.forEach(log => {
      providerCounts[log.provider] = (providerCounts[log.provider] || 0) + 1
      totalApiCalls++
    })

    console.log('API Logs provider counts:', providerCounts)
  } catch (error) {
    console.error('Error fetching API logs:', error)
    // Keep empty providerCounts
  }

  const maxCount = Math.max(...Object.values(providerCounts), 1)

  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-lg shadow-slate-900/40 rounded-2xl">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          API Usage ({timeRange})
        </CardTitle>
        <CardDescription className="text-slate-400">
          Total calls: {totalApiCalls} | Real-time API provider usage statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-3">
          {Object.entries(providerCounts).length > 0 ? (
            Object.entries(providerCounts).map(([provider, count]) => (
              <div key={provider} className="flex items-center gap-3">
                <div className="w-20 text-sm text-slate-300 capitalize">{provider}</div>
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-slate-400 text-right">{count}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-2">No API calls recorded yet</p>
              <p className="text-xs text-slate-500">API usage will appear here once users start chatting</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboard() {
  // Verify admin access before rendering the dashboard
  const user = await verifyAdminAccess()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome, <ShieldCheck className="inline w-6 h-6 text-cyan-400 ml-2" /> Admin
          </h1>
          <p className="text-slate-400 text-sm">Your central control panel</p>
        </div>
        <LogoutButton />
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>}>
        <StatsCards />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feedback Section */}
        <Suspense fallback={<Card className="bg-slate-800/50 border-slate-700 animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-slate-700 rounded"></div>
          </CardContent>
        </Card>}>
          <FeedbackSection />
        </Suspense>

        {/* API Logs Section */}
        <Suspense fallback={<Card className="bg-slate-800/50 border-slate-700 animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-slate-700 rounded"></div>
          </CardContent>
        </Card>}>
          <ApiLogsSection />
        </Suspense>

        {/* Users Section - Full Width */}
        <div className="lg:col-span-2">
          <AdminUserManagement />
        </div>
      </div>
    </div>
  )
}
