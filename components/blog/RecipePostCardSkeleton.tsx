import { Skeleton } from "@/components/ui/skeleton"

export function RecipePostCardSkeleton() {
  return (
    <article className="rounded-lg overflow-hidden border border-shadow-gray bg-background">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-48 md:h-56" />

      {/* Content Skeleton */}
      <div className="p-5 md:p-6 flex flex-col min-h-[180px]">
        {/* Title Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>

        {/* Quick Info Metadata Skeleton */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </article>
  )
}
