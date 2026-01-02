"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bot, ChevronDown } from "lucide-react"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

interface ApiKeyStatus {
  groq: boolean
  openai: boolean
  claude: boolean
  gemini: boolean
}

const MODEL_OPTIONS = {
  groq: ["llama3-70b-8192", "mixtral-8x7b-32768"],
  openai: ["gpt-4o-mini", "gpt-4o"],
  claude: ["claude-3-haiku-20240307"],
  gemini: ["gemini-1.5-flash"]
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [availableKeys, setAvailableKeys] = useState<ApiKeyStatus>({
    groq: false,
    openai: false,
    claude: false,
    gemini: false
  })

  // Check available API keys
  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const res = await fetch('/api/settings/api-keys/status', {
          cache: 'no-store'
        })
        const data = await res.json()

        if (data.success) {
          setAvailableKeys(data.keys)
        }
      } catch (error) {
        console.error('Failed to check API keys:', error)
        // Fallback: check localStorage
        const keys: ApiKeyStatus = {
          groq: !!(typeof window !== 'undefined' && localStorage.getItem('groq_key')),
          openai: !!(typeof window !== 'undefined' && localStorage.getItem('openai_key')),
          claude: !!(typeof window !== 'undefined' && localStorage.getItem('claude_key')),
          gemini: !!(typeof window !== 'undefined' && localStorage.getItem('gemini_key'))
        }
        setAvailableKeys(keys)
      }
    }

    checkApiKeys()
  }, [])

  // Get available models based on API keys
  const getAvailableModels = () => {
    const models: Array<{ value: string; label: string; provider: string }> = []

    // Always include Auto option
    models.push({ value: "Auto", label: "Auto", provider: "auto" })

    // Add models based on available keys
    Object.entries(MODEL_OPTIONS).forEach(([provider, providerModels]) => {
      if (availableKeys[provider as keyof ApiKeyStatus]) {
        providerModels.forEach(model => {
          const label = `${provider.charAt(0).toUpperCase() + provider.slice(1)}: ${model}`
          models.push({ value: model, label, provider })
        })
      }
    })

    return models
  }

  const availableModels = getAvailableModels()
  const currentModel = availableModels.find(m => m.value === selectedModel) || availableModels[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 text-white/90 hover:text-white hover:bg-white/15 border border-white/20 backdrop-blur-md"
        >
          <Bot className="size-4 text-cyan-400" />
          <span className="font-medium">{currentModel?.label || "Auto"}</span>
          <ChevronDown className="size-4 text-white/60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-slate-800/95 backdrop-blur-xl border-white/20 text-white min-w-[200px]"
        align="start"
      >
        {availableModels.map((model) => (
          <DropdownMenuItem
            key={model.value}
            onClick={() => onModelChange(model.value)}
            className="hover:bg-white/10 cursor-pointer"
          >
            {model.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
