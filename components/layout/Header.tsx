"use client"

import { useTheme } from "next-themes"
import Link from "next/link"
import { Sun, Moon, UtensilsCrossed, Play } from "lucide-react"

export function Header() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
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
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </div>
    </header>
  )
}

