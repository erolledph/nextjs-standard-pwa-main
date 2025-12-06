import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

/**
 * Container Component
 * Provides consistent max-width and padding for page content
 * Matches rice-bowl's responsive container pattern
 */
export function Container({ 
  children, 
  className = '', 
  fullWidth = false 
}: ContainerProps) {
  return (
    <div className={`
      ${fullWidth ? 'w-full' : 'max-w-screen-lg mx-auto'}
      px-4 sm:px-6 lg:px-8
      ${className}
    `}>
      {children}
    </div>
  )
}
