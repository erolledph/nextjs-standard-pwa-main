import { Skeleton } from "@/components/ui/skeleton"

export function VideoCardSkeleton() {
  return (
    <article className="rounded-lg overflow-hidden border border-shadow-gray bg-background">
      {/* Thumbnail Skeleton */}
      <Skeleton className="w-full h-48 md:h-56" />

      {/* Content Skeleton */}
      <div className="p-5 md:p-6 flex flex-col">
        {/* Title Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
        </div>

        {/* Excerpt/Description Skeleton */}
        <div className="space-y-2 mb-4 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </article>
  )
}
