"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { User, Lock, Home, Trash2, Camera, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { updateProfile, changePassword, deleteAccount, uploadAvatar, removeAvatar } from "./actions"
import { testApiKeys } from "./testApiKeys"
import type { UserProfile } from "@/lib/supabase/getCurrentUserProfile"

interface SettingsPageClientProps {
  userProfile: UserProfile
}

export function SettingsPageClient({ userProfile }: SettingsPageClientProps) {
  const searchParams = useSearchParams()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check for success parameters and show toasts
    const success = searchParams.get("success")
    if (success === "profile-updated") {
      toast.success("Profile updated successfully!")
      // Clean up the URL
      window.history.replaceState({}, "", "/dashboard/settings")
    } else if (success === "password-changed") {
      toast.success("Password changed successfully!")
      // Clean up the URL
      window.history.replaceState({}, "", "/dashboard/settings")
    } else if (success === "avatar-uploaded") {
      toast.success("Avatar uploaded successfully!")
      // Clean up the URL and close dialog
      window.history.replaceState({}, "", "/dashboard/settings")
      setIsDialogOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    } else if (success === "avatar-removed") {
      toast.success("Avatar removed successfully!")
      // Clean up the URL
      window.history.replaceState({}, "", "/dashboard/settings")
    }
  }, [searchParams])

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", { description: "Only PNG, JPG, and JPEG files are allowed." })
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error("File too large", { description: "File size must be less than 5MB." })
        return
      }

      setSelectedFile(file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  // Handle avatar upload
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("avatar", selectedFile)
      await uploadAvatar(formData)
    } catch (error: any) {
      toast.error("Upload failed", { description: error.message || "Failed to upload avatar." })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar()
    } catch (error: any) {
      toast.error("Removal failed", { description: error.message || "Failed to remove avatar." })
    }
  }

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // API key testing state
  const [apiTestResults, setApiTestResults] = useState<{
    openai?: "working" | "invalid" | "error" | "missing"
    groq?: "working" | "invalid" | "error" | "missing"
    gemini?: "working" | "invalid" | "error" | "missing"
    claude?: "working" | "invalid" | "error" | "missing"
  } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const handleTestKeys = async (e?: React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault()
    try {
      setIsTesting(true)
      const res = await fetch("/api/test-keys")
      if (!res.ok) {
        setApiTestResults({ openai: "error", groq: "error", gemini: "error" })
        return
      }
      const data = await res.json()
      setApiTestResults(data)
    } catch (err) {
      setApiTestResults({ openai: "error", groq: "error", gemini: "error", claude: "error" })
    } finally {
      setIsTesting(false)
    }
  }

  const renderBadge = (status?: string) => {
    const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    if (!status || status === "missing") {
      return <span className={`${base} bg-slate-600 text-slate-200`}>Missing</span>
    }
    if (status === "working") {
      return <span className={`${base} bg-emerald-600 text-white`}>Working</span>
    }
    if (status === "invalid") {
      return <span className={`${base} bg-red-600 text-white`}>Invalid</span>
    }
    return <span className={`${base} bg-yellow-500 text-white`}>Error</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6">
      {/* Ambient light effects */}
      <div className="ambient-light-1" />
      <div className="ambient-light-2" />
      <div className="ambient-light-3" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-300 mt-2">Manage your account settings and preferences</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-slate-800/60 hover:bg-slate-700/60 text-white border border-white/20 backdrop-blur-sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>

        {/* User Profile Card */}
        <Card className="glass-card backdrop-blur-xl bg-slate-900/60 border-white/20 shadow-lg shadow-cyan-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-cyan-400" />
              User Profile
            </CardTitle>
            <CardDescription className="text-slate-300">Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-cyan-400/50 ring-2 ring-cyan-400/20">
                <AvatarImage
                    src={userProfile.avatarUrl ? `${userProfile.avatarUrl}?t=${Date.now()}` : "/placeholder.svg?height=80&width=80"}
                    alt="User avatar"
                  />
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xl font-semibold">
                    {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : userProfile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-cyan-500 hover:bg-cyan-600 border-2 border-slate-900"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="backdrop-blur-xl bg-slate-900/95 border-white/20 text-white">
                    <DialogHeader>
                      <DialogTitle>Change Profile Picture</DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Upload a new profile picture or remove the current one.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-4">
                      {/* Current/Preview Avatar */}
                      <Avatar className="h-24 w-24 border-2 border-cyan-400/50 ring-2 ring-cyan-400/20">
                      <AvatarImage
                          src={previewUrl || (userProfile.avatarUrl ? `${userProfile.avatarUrl}?t=${Date.now()}` : "/placeholder.svg?height=96&width=96")}
                          alt="Avatar preview"
                        />
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-2xl font-semibold">
                          {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : userProfile.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50"
                        >
                          Choose File
                        </Button>
                        {userProfile.avatarUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveAvatar}
                            className="bg-red-900/50 border-red-700/50 text-red-300 hover:bg-red-800/50 hover:text-red-200"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Upload Button - Only show when file is selected */}
                      {selectedFile && (
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                        >
                          {isUploading ? "Uploading..." : "Upload Avatar"}
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">
                  {userProfile.fullName || "User"}
                </h3>
                <p className="text-slate-400 text-sm">{userProfile.email}</p>
              </div>
            </div>

            <form id="profile-form" action={updateProfile} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="fullName"
                  defaultValue={userProfile.fullName || ""}
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={userProfile.email}
                  readOnly
                  className="bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="profile-form"
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Password Change Card */}
        <Card className="glass-card backdrop-blur-xl bg-slate-900/60 border-white/20 shadow-lg shadow-cyan-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-cyan-400" />
              Change Password
            </CardTitle>
            <CardDescription className="text-slate-300">
              Update your account password for better security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="password-form" action={changePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-slate-200">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  required
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-200">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
                />
                <p className="text-xs text-slate-400">Password must be at least 8 characters long</p>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="password-form"
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Change Password
            </Button>
          </CardFooter>
        </Card>

      {/* API Key Testing Card */}
      <Card className="glass-card backdrop-blur-xl bg-slate-900/60 border-white/20 shadow-lg shadow-cyan-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">API Keys</CardTitle>
          <CardDescription className="text-slate-300">
            Test stored API keys without exposing them.
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <div className="text-sm text-slate-300">OpenAI</div>
              <div>{renderBadge(apiTestResults?.openai)}</div>
            </div>

            <div className="flex justify-between items-center px-4 py-2 border-b">
              <div className="text-sm text-slate-300">Groq</div>
              <div>{renderBadge(apiTestResults?.groq)}</div>
            </div>

            <div className="flex justify-between items-center px-4 py-2 border-b">
              <div className="text-sm text-slate-300">Gemini</div>
              <div>{renderBadge(apiTestResults?.gemini)}</div>
            </div>

            <div className="flex justify-between items-center px-4 py-2">
              <div className="text-sm text-slate-300">Claude</div>
              <div>{renderBadge(apiTestResults?.claude)}</div>
            </div>
            <div className="pt-2 px-4">
              <form>
                <Button
                  formAction={testApiKeys}
                  onClick={handleTestKeys}
                  className="bg-slate-700/60 hover:bg-slate-700/70 text-white"
                  disabled={isTesting}
                >
                  {isTesting ? "Testing..." : "Test API Keys"}
                </Button>
              </form>
            </div>
          </CardContent>
      </Card>

        {/* Danger Zone Card */}
        <Card className="glass-card backdrop-blur-xl bg-red-950/40 border-red-500/30 shadow-lg shadow-red-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trash2 className="h-5 w-5 text-red-400" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-slate-300">
              Irreversible actions that will permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="backdrop-blur-xl bg-slate-900/95 border-red-500/30 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    This action cannot be undone. This will permanently delete your account and remove your data from
                    our servers. All your API keys, chat history, and settings will be lost forever.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        const result = await deleteAccount()
                        if (result.success) {
                          toast.success("Account deleted successfully. Redirecting...")
                          // Small delay to show the toast before redirecting
                          setTimeout(() => {
                            window.location.href = "/signup"
                          }, 1500)
                        }
                      } catch (err: any) {
                        toast.error(err.message || "Failed to delete account")
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
