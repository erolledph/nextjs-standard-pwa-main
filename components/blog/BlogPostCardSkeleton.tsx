import { Skeleton } from "@/components/ui/skeleton"

interface BlogPostCardSkeletonProps {
  titleSize?: "small" | "medium" | "large"
  showImage?: boolean
}

export function BlogPostCardSkeleton({
  titleSize = "medium",
  showImage = true,
}: BlogPostCardSkeletonProps) {
  const titleHeightClasses = {
    small: "h-7 sm:h-8",
    medium: "h-8 sm:h-9",
    large: "h-10 sm:h-12",
  }

  const avatarSizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-10 h-10",
  }

  return (
    <article className="group rounded-lg overflow-hidden border border-shadow-gray bg-background hover:bg-muted/50">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-48 md:h-56" />

      {/* Content Skeleton */}
      <div className="p-5 md:p-6 flex flex-col min-h-[280px]">
        {/* Title Skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-3 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-3 border-t border-border mt-auto flex-wrap">
          <div className="flex items-center gap-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-1" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </article>
  )
}
