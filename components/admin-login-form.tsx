"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useTransition } from "react"

interface AdminLoginFormProps {
  action: (formData: FormData) => Promise<{ error?: string } | void>
}

export default function AdminLoginForm({ action }: AdminLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData)

      if (result?.error) {
        toast.error("Admin login failed", {
          description: result.error
        })
      }
      // If successful, the redirect will happen automatically
    })
  }

  return (
    <Card className="w-full max-w-md shadow-xl border border-white/20 rounded-2xl bg-slate-900/90 backdrop-blur-xl">
      <CardHeader className="space-y-6 text-center pt-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <Shield className="w-6 h-6 text-red-400" />
            <span>Admin Access</span>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
          <CardDescription className="text-slate-400">Enter admin credentials to access the system dashboard</CardDescription>
        </div>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Admin email address"
              required
              className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-red-400 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                required
                className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-slate-500 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none z-10"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Authenticating..." : "Access Admin Panel"}
          </Button>
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to homepage
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

export { AdminLoginForm }
