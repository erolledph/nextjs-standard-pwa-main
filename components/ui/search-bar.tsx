"use client"

import { Search } from "lucide-react"

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch: (e: React.FormEvent) => void
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-6 py-4 rounded-md border border-border bg-background text-foreground placeholder-foreground/50 text-base shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-accent transition-colors"
        >
          <Search className="w-5 h-5 text-primary" />
        </button>
      </div>
    </form>
  )
}
