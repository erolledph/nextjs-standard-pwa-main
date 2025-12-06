import { ReactNode } from 'react'

interface FlexProps {
  children: ReactNode
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  wrap?: boolean
  className?: string
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

/**
 * Flex Component
 * Utility component for flexbox layouts
 */
export function Flex({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className = '',
}: FlexProps) {
  return (
    <div className={`
      flex
      flex-${direction}
      ${alignClasses[align]}
      ${justifyClasses[justify]}
      ${gapClasses[gap]}
      ${wrap ? 'flex-wrap' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface StackProps {
  children: ReactNode
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: string
}

const stackAlignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

/**
 * Stack Component
 * Vertical flex layout (column direction)
 */
export function Stack({
  children,
  gap = 'md',
  align = 'stretch',
  className = '',
}: StackProps) {
  return (
    <div className={`
      flex flex-col
      ${stackAlignClasses[align]}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  )
}
