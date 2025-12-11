"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { BlogPostCard } from "@/components/blog/BlogPostCard"
import { BlogPostCardSkeleton } from "@/components/blog/BlogPostCardSkeleton"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  content: string
}

interface BlogListProps {
  posts: BlogPost[]
}

export function BlogListClient({ posts }: BlogListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading state for 300ms to show skeleton
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground mb-8">No stories published yet</p>
        <Link href="/admin/login">
          <Button size="lg" className="rounded-full px-8 h-12 font-medium">Start writing</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <SearchBar
        placeholder="Search blog posts..."
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <BlogPostCardSkeleton key={i} />)
          : posts.map((post) => (
              <BlogPostCard
                key={post.id}
                id={post.id}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt}
                date={post.date}
                author={post.author}
                tags={post.tags}
                image={post.image}
                content={post.content}
                titleSize="medium"
                showFullDate={false}
              />
            ))}
      </div>
    </div>
  )
}
