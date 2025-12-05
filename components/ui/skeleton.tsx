import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-200 dark:bg-slate-800",
        "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardSkeleton Component
 * Loading state for card components
 */
export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Image */}
      <Skeleton className="h-40 w-full rounded-lg" />

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Footer */}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  )
}

/**
 * GridSkeleton Component
 * Loading state for grid layouts
 */
interface GridSkeletonProps {
  count?: number
  columns?: number
}

export function GridSkeleton({ count = 6, columns = 3 }: GridSkeletonProps) {
  const columnMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }
  
  const columnClass = columnMap[columns] || 'grid-cols-3'

  return (
    <div className={`grid ${columnClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * ListSkeleton Component
 * Loading state for list items
 */
interface ListSkeletonProps {
  count?: number
}

export function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * DetailSkeleton Component
 * Loading state for detail/article pages
 */
export function DetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Image */}
      <Skeleton className="h-96 w-full rounded-lg" />

      {/* Title & Meta */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Divider */}
      <Skeleton className="h-px w-full" />

      {/* Content Paragraphs */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
        <Skeleton className="h-6 w-1/2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton }
