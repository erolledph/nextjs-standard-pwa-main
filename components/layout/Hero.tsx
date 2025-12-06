import { ReactNode } from 'react'
import { Container } from './Container'

interface HeroProps {
  title: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
  align?: 'left' | 'center'
}

/**
 * Hero Section Component
 * Provides consistent header styling for pages
 * Similar to rice-bowl's page headers
 */
export function Hero({
  title,
  subtitle,
  description,
  children,
  className = '',
  align = 'center',
}: HeroProps) {
  const alignment = align === 'center' ? 'text-center' : 'text-left'

  return (
    <Container className={`py-12 md:py-16 lg:py-20 ${className}`}>
      <div className={alignment}>
        {subtitle && (
          <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
            {subtitle}
          </p>
        )}
        
        {typeof title === 'string' ? (
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {title}
          </h1>
        ) : (
          <div className="mb-4">{title}</div>
        )}

        {description && (
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
            {description}
          </p>
        )}

        {children}
      </div>
    </Container>
  )
}
