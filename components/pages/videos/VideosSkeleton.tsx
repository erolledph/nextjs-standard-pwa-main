"use client"

export function VideoCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-lg animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="h-48 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-700 dark:to-zinc-600" />

      {/* Title Skeleton */}
      <div className="p-4">
        <div className="h-6 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-700 dark:to-zinc-600 rounded w-3/4" />
      </div>
    </div>
  )
}

export function VideosSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  )
}
