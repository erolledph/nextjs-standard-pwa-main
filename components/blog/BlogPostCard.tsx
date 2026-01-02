"use client"

import Link from "next/link"
import { calculateReadingTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface BlogPostCardProps {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  content?: string
  titleSize?: "small" | "medium" | "large"
  showFullDate?: boolean
}

export function BlogPostCard({
  id,
  title,
  slug,
  excerpt,
  date,
  author,
  tags,
  image,
  content,
  titleSize = "medium",
  showFullDate = false,
}: BlogPostCardProps) {
  const readingTime = content ? calculateReadingTime(content) : "5 min read"

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString)
    if (showFullDate) {
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <article className="group rounded-lg overflow-hidden border border-shadow-gray hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background hover:bg-muted/50">
      <Link href={`/blog/${slug}`} className="flex flex-col h-full">
        {/* Blog Image */}
        <div className="w-full h-48 md:h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={`${title} - World Food Recipes Blog`}
              title={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm">Food Story</p>
            </div>
          )}
        </div>

        {/* Blog Info */}
        <div className="flex-1 p-5 md:p-6 flex flex-col min-h-[180px]">
          <h3 className="text-lg md:text-xl font-bold text-foreground dark:text-white mb-4 line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
            {title}
          </h3>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs font-medium tracking-wider uppercase px-2 py-1 rounded-full bg-muted text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-3 border-t border-shadow-gray mt-auto">
            <div className="flex items-center gap-1">
              <img
                src="/avatar.svg"
                alt={author || "Anonymous"}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{author || "Anonymous"}</span>
            </div>
            <span>·</span>
            <time>{formatDate(date)}</time>
            <span>·</span>
            <span>{readingTime}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
