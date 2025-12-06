"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor } from "lucide-react"
import { 
  BeforeInstallPromptEvent, 
  canInstallPWA, 
  isPWA, 
  isIOS, 
  isAndroid,
  getInstallInstructions 
} from "@/lib/pwa"

export function InstallPrompt() {
  // Install prompt is now in the Header component
  // This component is kept for backwards compatibility but doesn't render anything
  return null
}