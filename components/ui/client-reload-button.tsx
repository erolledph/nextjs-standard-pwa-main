"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function ClientReloadButton() {
  return (
    <Button
      onClick={() => window.location.reload()}
      className="rounded-full"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  )
}