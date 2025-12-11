import { ReactNode } from 'react'

interface PageProps {
  title?: string
  description?: string
  children: ReactNode
}

/**
 * Page Wrapper Component
 * Provides consistent layout with header, appbar, and footer
 * Similar to rice-bowl's Page component for standardization
 */
export function Page({ children }: PageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
