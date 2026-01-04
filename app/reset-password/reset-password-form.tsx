"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react"
import { resetPassword } from "./actions"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const searchParams = useSearchParams()
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      setError("Invalid or expired reset link. Please request a new password reset.")
    }
  }, [accessToken, refreshToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    try {
      await resetPassword(new FormData(e.target as HTMLFormElement))
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.")
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md shadow-xl border border-white/20 rounded-2xl bg-slate-900/90 backdrop-blur-xl">
            <CardHeader className="space-y-6 text-center pt-8">
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-2xl font-bold text-white">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <span>Brainlyx AI</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                <CardTitle className="text-2xl text-white">Password reset successful!</CardTitle>
                <CardDescription className="text-slate-400">
                  Your password has been updated. You can now sign in with your new password.
                </CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-center pb-8">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-500/30">
                  Sign in
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Ambient Light Effects */}
      <div className="ambient-light-1" />
      <div className="ambient-light-2" />
      <div className="ambient-light-3" />

      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-xl border border-white/20 rounded-2xl bg-slate-900/90 backdrop-blur-xl">
          <CardHeader className="space-y-6 text-center pt-8">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                <Zap className="w-6 h-6 text-cyan-400" />
                <span>Brainlyx AI</span>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl text-white">Set new password</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your new password below.
              </CardDescription>
            </div>
          </CardHeader>

          {error && (
            <div className="px-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
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
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
              >
                Reset Password
              </Button>
              <Link href="/login" className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
