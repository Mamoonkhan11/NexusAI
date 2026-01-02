"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { saveApiKeys, getExistingApiKeysMetadata, verifyApiKey } from "./actions"
import { ApiKeyInput } from "./api-key-input"

export function ApiKeysPageClient() {
  const [existingKeysMetadata, setExistingKeysMetadata] = useState<any>(null)
  const [verifyingKeys, setVerifyingKeys] = useState<{[key: string]: boolean}>({})
  const [verificationResults, setVerificationResults] = useState<{[key: string]: {valid: boolean, error?: string}}>({})
  const [modifyingKeys, setModifyingKeys] = useState<{[key: string]: boolean}>({})
  const [keyValues, setKeyValues] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Fetch existing keys metadata
    getExistingApiKeysMetadata().then(setExistingKeysMetadata)

    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("success") === "api-keys-saved") {
      toast.success("API keys saved successfully!")
      // Clean up the URL
      window.history.replaceState({}, "", "/dashboard/api-keys")
    }
  }, [])

  const handleVerifyApiKey = async (provider: string, apiKey: string) => {
    if (!apiKey || apiKey.trim() === "") {
      toast.error("No API key provided", { description: `Please enter your ${provider} API key first.` })
      return
    }

    setVerifyingKeys(prev => ({ ...prev, [provider]: true }))

    try {
      const result = await verifyApiKey(provider, apiKey.trim())
      setVerificationResults(prev => ({ ...prev, [provider]: result }))

      if (result.valid) {
        toast.success(`${provider} API key verified!`, { description: "Your API key is working correctly." })
      } else {
        toast.error(`${provider} API key invalid`, { description: result.error || "Please check your API key." })
      }
    } catch (error) {
      console.error(`Error verifying ${provider} API key:`, error)
      toast.error("Verification failed", { description: "Unable to verify API key. Please try again." })
    } finally {
      setVerifyingKeys(prev => ({ ...prev, [provider]: false }))
    }
  }

  const handleStartModify = (provider: string) => {
    setModifyingKeys(prev => ({ ...prev, [provider]: true }))
  }

  const handleCancelModify = (provider: string) => {
    setModifyingKeys(prev => ({ ...prev, [provider]: false }))
    // Clear verification results when canceling
    setVerificationResults(prev => {
      const newResults = { ...prev }
      delete newResults[provider]
      return newResults
    })
  }

  if (!existingKeysMetadata) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
          <p className="text-slate-400">Manage your API keys for AI services</p>
        </div>

        {!existingKeysMetadata?.hasGroq && (
          <Alert className="border-amber-500/40 bg-amber-500/10 backdrop-blur-xl">
            <AlertCircle className="size-5 text-amber-400" />
            <AlertDescription className="text-amber-200">
              Groq API key is required to use the AI features. Please add your Groq key below.
            </AlertDescription>
          </Alert>
        )}

        <form action={saveApiKeys} className="space-y-4">
          {/* Groq API Key */}
          <Card className="glass-card backdrop-blur-xl bg-black/40 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                Groq API Key
                <span className="text-xs font-normal text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-400/30">
                  Required
                </span>
              </CardTitle>
              <CardDescription className="text-slate-400">Your Groq API key for fast AI inference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {existingKeysMetadata?.hasGroq && !modifyingKeys.groq ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm font-medium">API Key Saved</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartModify("groq")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 text-xs"
                      >
                        Modify Key
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.groq}
                      onClick={() => {
                        // For saved keys, we can't verify without the actual key value
                        toast.info("Key verification", { description: "Enter the key in modify mode to verify it." })
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      Verify Key
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <ApiKeyInput
                    id="groq"
                    name="groq_key"
                    label="API Key"
                    placeholder={modifyingKeys.groq ? "Enter new Groq API key..." : "gsk_..."}
                    value={keyValues.groq || ""}
                    onChange={(value) => setKeyValues(prev => ({ ...prev, groq: value }))}
                    required
                  />
                  <div className="flex items-center gap-2">
                    {modifyingKeys.groq && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelModify("groq")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.groq}
                      onClick={() => {
                        const keyValue = keyValues.groq || (document.getElementById("groq") as HTMLInputElement)?.value || ""
                        handleVerifyApiKey("groq", keyValue)
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      {verifyingKeys.groq ? "Verifying..." : "Verify Key"}
                    </Button>
                    {verificationResults.groq && (
                      <div className={`flex items-center gap-1 text-xs ${verificationResults.groq.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {verificationResults.groq.valid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* OpenAI API Key */}
          <Card className={`glass-card backdrop-blur-xl bg-black/40 border-white/20 shadow-xl ${!existingKeysMetadata?.hasGroq ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                OpenAI API Key
                <span className="text-xs font-normal text-slate-400 bg-slate-500/20 px-2 py-0.5 rounded-full border border-slate-400/30">
                  Optional
                </span>
                {!existingKeysMetadata?.hasGroq && (
                  <span className="text-xs font-normal text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    🔒 Groq Required First
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {!existingKeysMetadata?.hasGroq
                  ? "Add Groq API key first to unlock OpenAI configuration"
                  : "Your OpenAI API key for GPT models"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {existingKeysMetadata?.hasOpenAI && !modifyingKeys.openai ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm font-medium">API Key Saved</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartModify("openai")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 text-xs"
                      >
                        Modify Key
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.openai}
                      onClick={() => {
                        // For saved keys, we can't verify without the actual key value
                        toast.info("Key verification", { description: "Enter the key in modify mode to verify it." })
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      Verify Key
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <ApiKeyInput
                    id="openai"
                    name="openai_key"
                    label="API Key"
                    placeholder={modifyingKeys.openai ? "Enter new OpenAI API key..." : "sk-..."}
                    value={keyValues.openai || ""}
                    onChange={(value) => setKeyValues(prev => ({ ...prev, openai: value }))}
                  />
                  <div className="flex items-center gap-2">
                    {modifyingKeys.openai && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelModify("openai")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.openai}
                      onClick={() => {
                        const keyValue = keyValues.openai || (document.getElementById("openai") as HTMLInputElement)?.value || ""
                        handleVerifyApiKey("openai", keyValue)
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      {verifyingKeys.openai ? "Verifying..." : "Verify Key"}
                    </Button>
                    {verificationResults.openai && (
                      <div className={`flex items-center gap-1 text-xs ${verificationResults.openai.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {verificationResults.openai.valid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gemini API Key */}
          <Card className={`glass-card backdrop-blur-xl bg-black/40 border-white/20 shadow-xl ${!existingKeysMetadata?.hasGroq ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                Gemini API Key
                <span className="text-xs font-normal text-slate-400 bg-slate-500/20 px-2 py-0.5 rounded-full border border-slate-400/30">
                  Optional
                </span>
                {!existingKeysMetadata?.hasGroq && (
                  <span className="text-xs font-normal text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    🔒 Groq Required First
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {!existingKeysMetadata?.hasGroq
                  ? "Add Groq API key first to unlock Gemini configuration"
                  : "Your Google Gemini API key"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {existingKeysMetadata?.hasGemini && !modifyingKeys.gemini ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm font-medium">API Key Saved</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartModify("gemini")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 text-xs"
                      >
                        Modify Key
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.gemini}
                      onClick={() => {
                        toast.info("Key verification", { description: "Enter the key in modify mode to verify it." })
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      Verify Key
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <ApiKeyInput
                    id="gemini"
                    name="gemini_key"
                    label="API Key"
                    placeholder={modifyingKeys.gemini ? "Enter new Gemini API key..." : "AIza..."}
                    value={keyValues.gemini || ""}
                    onChange={(value) => setKeyValues(prev => ({ ...prev, gemini: value }))}
                  />
                  <div className="flex items-center gap-2">
                    {modifyingKeys.gemini && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelModify("gemini")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.gemini}
                      onClick={() => {
                        const keyValue = keyValues.gemini || (document.getElementById("gemini") as HTMLInputElement)?.value || ""
                        handleVerifyApiKey("gemini", keyValue)
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      {verifyingKeys.gemini ? "Verifying..." : "Verify Key"}
                    </Button>
                    {verificationResults.gemini && (
                      <div className={`flex items-center gap-1 text-xs ${verificationResults.gemini.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {verificationResults.gemini.valid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claude API Key */}
          <Card className={`glass-card backdrop-blur-xl bg-black/40 border-white/20 shadow-xl ${!existingKeysMetadata?.hasGroq ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                Claude API Key
                <span className="text-xs font-normal text-slate-400 bg-slate-500/20 px-2 py-0.5 rounded-full border border-slate-400/30">
                  Optional
                </span>
                {!existingKeysMetadata?.hasGroq && (
                  <span className="text-xs font-normal text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    🔒 Groq Required First
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {!existingKeysMetadata?.hasGroq
                  ? "Add Groq API key first to unlock Claude configuration"
                  : "Your Anthropic Claude API key"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {existingKeysMetadata?.hasClaude && !modifyingKeys.claude ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm font-medium">API Key Saved</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartModify("claude")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 text-xs"
                      >
                        Modify Key
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.claude}
                      onClick={() => {
                        toast.info("Key verification", { description: "Enter the key in modify mode to verify it." })
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      Verify Key
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <ApiKeyInput
                    id="claude"
                    name="claude_key"
                    label="API Key"
                    placeholder={modifyingKeys.claude ? "Enter new Claude API key..." : "sk-ant-..."}
                    value={keyValues.claude || ""}
                    onChange={(value) => setKeyValues(prev => ({ ...prev, claude: value }))}
                  />
                  <div className="flex items-center gap-2">
                    {modifyingKeys.claude && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelModify("claude")}
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verifyingKeys.claude}
                      onClick={() => {
                        const keyValue = keyValues.claude || (document.getElementById("claude") as HTMLInputElement)?.value || ""
                        handleVerifyApiKey("claude", keyValue)
                      }}
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
                    >
                      {verifyingKeys.claude ? "Verifying..." : "Verify Key"}
                    </Button>
                    {verificationResults.claude && (
                      <div className={`flex items-center gap-1 text-xs ${verificationResults.claude.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {verificationResults.claude.valid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium shadow-lg shadow-cyan-500/30"
            >
              Save API Keys
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
