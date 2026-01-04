"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Key, Settings, Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logout } from "@/app/(auth)/logout/actions"

const sidebarItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "AI Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    name: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardLayout({
  children,
  user
}: {
  children: React.ReactNode
  user?: { id: string; email: string; fullName?: string } | null
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Background ambient lights */}
      <div className="ambient-light-1" />
      <div className="ambient-light-2" />
      <div className="ambient-light-3" />

      <div className="relative z-10 flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-56 border-r border-white/20 glass-card backdrop-blur-xl bg-black/40">
          <div className="flex items-center h-14 px-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-base font-semibold text-white">Brainlyx AI</span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all group",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-56 glass-card backdrop-blur-xl bg-black/50 border-r border-white/20">
              <div className="flex items-center justify-between h-14 px-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="text-base font-semibold text-white">Brainlyx AI</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-white hover:bg-white/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>

              <nav className="px-3 py-4 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all",
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/30"
                          : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent",
                      )}
                    >
                      <Icon className="size-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-white/20 glass-card backdrop-blur-xl bg-black/30 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-8 text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>

              <div className="flex items-center gap-2 lg:hidden">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Brainlyx AI</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?.email && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-slate-400">Welcome,</span>
                  <span className="font-medium text-white">{user.email}</span>
                </div>
              )}
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  Logout
                </Button>
              </form>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
