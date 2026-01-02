"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

interface ApiKeyInputProps {
  id: string
  name: string
  label: string
  placeholder: string
  required?: boolean
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
}

export function ApiKeyInput({ id, name, label, placeholder, required, defaultValue, value, onChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-300">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showKey ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="pr-10 bg-black/30 border-white/20 text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-cyan-400/30"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
        >
          {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}
