"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return NextResponse.json({
      userName: user?.user_metadata?.name || null
    })
  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ userName: null }, { status: 500 })
  }
}
