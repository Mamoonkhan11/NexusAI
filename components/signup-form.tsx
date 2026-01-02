"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Zap } from "lucide-react"
import { toast } from "sonner"
import { signup } from "@/app/signup/actions"
import { useTransition } from "react"

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signup(formData)

      if (result?.error) {
        toast.error("Signup failed", {
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
            <Zap className="w-6 h-6 text-cyan-400" />
            <span>NexusAI</span>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl text-white">Create an account</CardTitle>
          <CardDescription className="text-slate-400">Enter your details to get started</CardDescription>
        </div>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200 font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              required
              className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Your email address"
              required
              className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg"
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
                placeholder="Create a password"
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                required
                className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-slate-500 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none z-10"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-center text-slate-400">
            {"Already have an account? "}
            <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export { SignupForm }