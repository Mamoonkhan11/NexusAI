"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to update your profile")
  }

  // Get name from form data
  const name = formData.get("fullName") as string

  // Validate name
  if (!name || name.trim() === "") {
    throw new Error("Name cannot be empty")
  }

  // Update user metadata
  const { error } = await supabase.auth.updateUser({
    data: { name: name.trim() }
  })

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error("Failed to update profile. Please try again.")
  }

  // Redirect back to settings page with success message
  redirect("/dashboard/settings?success=profile-updated")
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to change your password")
  }

  // Extract passwords from form data
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  // Validate inputs
  if (!currentPassword || currentPassword.trim() === "") {
    throw new Error("Current password is required")
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long")
  }

  if (currentPassword === newPassword) {
    throw new Error("New password must be different from current password")
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword
  })

  if (signInError) {
    throw new Error("Current password is incorrect")
  }

  // Update user password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error("Error changing password:", error)
    throw new Error("Failed to change password. Please try again.")
  }

  // Redirect back to settings page with success message
  redirect("/dashboard/settings?success=password-changed")
}

export async function deleteAccount() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to delete your account")
  }

  // Note: This requires service role key for admin operations
  // In production, you might want to handle this through a separate admin service
  // or use a different approach for user account deletion
  const { error } = await supabase.auth.admin.deleteUser(user.id)

  if (error) {
    console.error("Error deleting account:", error)
    throw new Error("Failed to delete account. Please contact support.")
  }

  // Return success - client will handle redirect after showing toast
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to upload an avatar")
  }

  // Get the file from form data
  const file = formData.get("avatar") as File

  if (!file) {
    throw new Error("No file provided")
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PNG, JPG, and JPEG files are allowed")
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB")
  }

  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true, // Replace existing file
        contentType: file.type
      })

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      throw new Error("Failed to upload avatar. Please try again.")
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    if (!publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for avatar")
    }

    // Update user metadata with avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrlData.publicUrl }
    })

    if (updateError) {
      console.error("Error updating user metadata:", updateError)
      // Try to clean up the uploaded file if metadata update fails
      await supabase.storage.from("avatars").remove([fileName])
      throw new Error("Failed to update profile with avatar. Please try again.")
    }

    // Redirect back to settings page with success message
    redirect("/dashboard/settings?success=avatar-uploaded")
  } catch (error) {
    console.error("Avatar upload error:", error)
    throw error
  }
}

export async function removeAvatar() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to remove your avatar")
  }

  try {
    // Get current avatar URL from user metadata
    const currentAvatarUrl = user.user_metadata?.avatar_url

    if (currentAvatarUrl) {
      // Extract filename from URL
      const urlParts = currentAvatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([fileName])

      if (deleteError) {
        console.error("Error deleting avatar from storage:", deleteError)
        // Continue with metadata update even if storage deletion fails
      }
    }

    // Update user metadata to remove avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: null }
    })

    if (updateError) {
      console.error("Error updating user metadata:", updateError)
      throw new Error("Failed to remove avatar. Please try again.")
    }

    // Redirect back to settings page with success message
    redirect("/dashboard/settings?success=avatar-removed")
  } catch (error) {
    console.error("Avatar removal error:", error)
    throw error
  }
}