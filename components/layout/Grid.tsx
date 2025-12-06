import { ReactNode } from 'react'

interface GridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

/**
 * Grid Component
 * Provides consistent responsive grid layout
 */
export function Grid({ 
  children, 
  columns = 3, 
  gap = 'md',
  className = ''
}: GridProps) {
  return (
    <div className={`
      grid
      ${columnClasses[columns]}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface GridItemProps {
  children: ReactNode
  span?: 1 | 2 | 3 | 4
  className?: string
}

export function GridItem({ 
  children, 
  span = 1,
  className = ''
}: GridItemProps) {
  const spanClasses = {
    1: '',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-3',
    4: 'col-span-1 md:col-span-4',
  }

  return (
    <div className={`${spanClasses[span]} ${className}`}>
      {children}
    </div>
  )
}
