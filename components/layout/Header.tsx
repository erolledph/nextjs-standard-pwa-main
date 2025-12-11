"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Sun, Moon, UtensilsCrossed, Play, Download } from "lucide-react"
import { isPWA, canInstallPWA, isIOS } from "@/lib/pwa"
import type { BeforeInstallPromptEvent } from "@/lib/pwa"

export function Header() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const currentTheme = theme === 'system' ? systemTheme : theme
    setIsDark(currentTheme === 'dark')
  }, [theme, systemTheme, mounted])

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isPWA())

    // Don't show prompt if already installed
    if (isPWA()) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For iOS devices, show install button
    if (isIOS() && canInstallPWA()) {
      setShowInstallButton(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS()) {
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }

      setDeferredPrompt(null)
      setShowInstallButton(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <UtensilsCrossed className="w-6 h-6" style={{ color: '#FF7518' }} />
          <span className="hidden sm:inline text-lg font-bold tracking-tight" style={{ color: '#FF7518', fontFamily: 'Georgia, serif' }}>World Food Recipes</span>
          <span className="sm:hidden text-sm font-bold tracking-tight" style={{ color: '#FF7518', fontFamily: 'Georgia, serif' }}>WFR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/recipes" className="text-sm font-medium transition-colors" style={{ color: '#8b8078' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FF7518'} onMouseLeave={(e) => e.currentTarget.style.color = '#8b8078'}>
            Recipes
          </Link>
          <Link href="/videos" className="text-sm font-medium transition-colors" style={{ color: '#8b8078' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FF7518'} onMouseLeave={(e) => e.currentTarget.style.color = '#8b8078'}>
            Videos
          </Link>
          <Link href="/blog" className="text-sm font-medium transition-colors" style={{ color: '#8b8078' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FF7518'} onMouseLeave={(e) => e.currentTarget.style.color = '#8b8078'}>
            Blog
          </Link>
          <Link href="/favorites" className="text-sm font-medium transition-colors" style={{ color: '#8b8078' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FF7518'} onMouseLeave={(e) => e.currentTarget.style.color = '#8b8078'}>
            Favorites
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {mounted && !isInstalled && showInstallButton && (
            <>
              {/* Desktop: Show button with text */}
              <button
                onClick={handleInstallClick}
                className="hidden md:inline-flex items-center gap-2 font-bold py-2 px-4 rounded transition-colors"
                style={{ backgroundColor: '#FF7518', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E66A0F'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF7518'}
                aria-label="Install app"
              >
                <Download className="w-4 h-4" />
                <span>Install app</span>
              </button>
              
              {/* Mobile: Show button with text and icon */}
              <button
                onClick={handleInstallClick}
                className="md:hidden flex items-center gap-2 font-bold py-2 px-3 rounded transition-colors"
                style={{ backgroundColor: '#FF7518', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E66A0F'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF7518'}
                aria-label="Install app"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Install app</span>
              </button>
            </>
          )}
          
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center text-sm text-foreground/50 hover:text-foreground/70 transition-colors p-2 rounded-md hover:bg-muted"
            aria-label="Toggle theme"
            suppressHydrationWarning
          >
            {mounted && (
              <>
                {!isDark ? (
                  <Sun className="w-4 h-4 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 transition-transform" />
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

