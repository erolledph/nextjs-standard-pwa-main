import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
}

/**
 * Section Wrapper Component
 * Provides consistent spacing and max-width constraints
 * Similar to rice-bowl's Section component
 */
export function Section({ children, className = '' }: SectionProps) {
  return (
    <section className={`px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-8 md:py-12 ${className}`}>
      {children}
    </section>
  )
}
