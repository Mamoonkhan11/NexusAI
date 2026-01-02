"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, ArrowLeft, Mail } from "lucide-react"
import { forgotPassword } from "./actions"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

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
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-2xl font-bold text-white">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <span>NexusAI</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">powered by Vionys</span>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl text-white">
                {isSubmitted ? "Check your email" : "Reset your password"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isSubmitted
                  ? "We've sent you a password reset link. Please check your email."
                  : "Enter your email address and we'll send you a link to reset your password."
                }
              </CardDescription>
            </div>
          </CardHeader>

          {!isSubmitted ? (
            <form action={async (formData: FormData) => {
              try {
                await forgotPassword(formData)
                setIsSubmitted(true)
              } catch (error) {
                console.error("Error sending reset email:", error)
              }
            }}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-400 focus-visible:ring-cyan-400 rounded-lg"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pb-8">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Link
                </Button>
                <Link href="/login" className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full border-slate-700/50 bg-slate-800/50 text-white hover:bg-slate-700/50"
              >
                Send another link
              </Button>
              <Link href="/login" className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
