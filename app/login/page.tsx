import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, ShieldCheck } from "lucide-react"
import LoginForm from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
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
              <span className="text-xl font-bold text-white">Brainlyx AI</span>
              <span className="text-xs text-slate-400 font-medium">powered by Vionys</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin-login">
              <Button className="text-sm px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}