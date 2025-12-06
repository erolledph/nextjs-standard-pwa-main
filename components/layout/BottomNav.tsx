"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, UtensilsCrossed, BookOpen, Heart, Play } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
    { href: "/videos", label: "Videos", icon: Play },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/favorites", label: "Favorites", icon: Heart },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-lg">
      <div className="mx-auto max-w-7xl px-0 py-2 flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center py-2 px-4 gap-1 transition-all duration-200"
              aria-label={label}
            >
              <Icon
                className="w-6 h-6 transition-all"
                style={{
                  color: active ? "#FF7518" : "currentColor",
                }}
              />
              <span className="text-xs font-medium" style={active ? { color: "#FF7518" } : { color: '#64748b' }}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
