import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, ShieldCheck } from "lucide-react"
import AdminLoginForm from "@/components/admin-login-form"
import { adminLogin } from "./actions"

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Admin access to NexusAI system",
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Ambient Light Effects */}
      <div className="ambient-light-1" />
      <div className="ambient-light-2" />
      <div className="ambient-light-3" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-white">NexusAI</span>
              <span className="text-xs text-slate-400 font-medium">powered by Vionys</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="text-sm px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                Sign In
              </Button>
            </Link>
            <span className="text-sm text-slate-400 font-medium">Admin Access Portal</span>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-4">
        <AdminLoginForm action={adminLogin} />
      </div>
    </div>
  )
}
