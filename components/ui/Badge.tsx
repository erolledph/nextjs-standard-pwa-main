import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantClasses = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
  primary: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs font-medium rounded-md',
  md: 'px-3 py-1.5 text-sm font-semibold rounded-lg',
  lg: 'px-4 py-2 text-base font-bold rounded-lg',
}

/**
 * Badge Component
 * Reusable badge for labels, tags, and indicators
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span className={`
      inline-block
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {children}
    </span>
  )
}
