import { Suspense } from "react"
import { ApiKeysPageClient } from "./api-keys-client"

export default function ApiKeysPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApiKeysPageClient />
    </Suspense>
  )
}
