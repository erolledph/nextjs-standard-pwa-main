"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Sun, Moon, UtensilsCrossed, Play } from "lucide-react"

export function Header() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const currentTheme = theme === 'system' ? systemTheme : theme
    setIsDark(currentTheme === 'dark')
  }, [theme, systemTheme, mounted])

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
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

