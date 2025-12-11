"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { isPWA, getPWADisplayMode, checkForSWUpdate } from "@/lib/pwa"

interface PWAContextType {
  isInstalled: boolean
  displayMode: 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen'
  isOnline: boolean
  hasUpdate: boolean
  updateAvailable: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [displayMode, setDisplayMode] = useState<PWAContextType['displayMode']>('browser')
  const [isOnline, setIsOnline] = useState(true)
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    // Set initial values
    setIsInstalled(isPWA())
    setDisplayMode(getPWADisplayMode())
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for service worker updates
    checkForSWUpdate().then(setHasUpdate)

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => {
      setDisplayMode(getPWADisplayMode())
      setIsInstalled(isPWA())
    }

    mediaQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      mediaQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const updateAvailable = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  const value: PWAContextType = {
    isInstalled,
    displayMode,
    isOnline,
    hasUpdate,
    updateAvailable,
  }

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  )
}