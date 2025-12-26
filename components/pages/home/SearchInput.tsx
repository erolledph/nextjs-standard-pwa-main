"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search recipes & blog..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 pr-12 h-12 rounded-full text-base"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
      <Button
        type="submit"
        size="lg"
        className="rounded-full px-8 h-12 font-medium"
        style={{ backgroundColor: '#FF7518', borderColor: '#FF7518' }}
      >
        Search
      </Button>
    </form>
  )
}
