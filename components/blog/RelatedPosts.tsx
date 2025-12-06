"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  content?: string
}

interface RelatedPostsProps {
  currentSlug: string
  currentTags?: string[]
  heading?: string
  subheading?: string
  showCTA?: boolean
  limit?: number
}

export function RelatedPosts({
  currentSlug,
  currentTags = [],
  heading = "Related",
  subheading = "Posts",
  showCTA = true,
  limit = 3
}: RelatedPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        const response = await fetch("/api/posts")
        if (!response.ok) throw new Error("Failed to fetch posts")
        const data: BlogPost[] = await response.json()

        // Filter out current post
        let filteredPosts = data.filter((post) => post.slug !== currentSlug)

        // If current post has tags, prioritize posts with matching tags
        if (currentTags.length > 0) {
          // Score posts based on tag matches
          const scoredPosts = filteredPosts.map((post) => {
            const matchedTags = post.tags?.filter((tag) =>
              currentTags.includes(tag)
            ) || []
            return {
              ...post,
              tagMatchCount: matchedTags.length,
            }
          })

          // Sort by tag match count (descending), then by date (descending)
          scoredPosts.sort((a, b) => {
            if (b.tagMatchCount !== a.tagMatchCount) {
              return b.tagMatchCount - a.tagMatchCount
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          })

          filteredPosts = scoredPosts.map(({ tagMatchCount, ...post }) => post)
        } else {
          // Fallback: sort by date if no tags
          filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }

        setPosts(filteredPosts.slice(0, limit))
      } catch (err) {
        console.error("Failed to load related posts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedPosts()
  }, [currentSlug, currentTags, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <BlogPostCardSkeleton key={i} titleSize="small" showImage={i === 1} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No related posts found</p>
        <Link href="/blog">
          <Button>View all posts</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
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
            titleSize="small"
            showFullDate={false}
          />
        ))}
      </div>

      {showCTA && posts.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button variant="outline">View all posts →</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
