interface DividerProps {
  className?: string
  vertical?: boolean
  margin?: 'sm' | 'md' | 'lg'
}

const marginClasses = {
  sm: 'my-2',
  md: 'my-4 md:my-6',
  lg: 'my-6 md:my-8 lg:my-12',
}

const verticalMarginClasses = {
  sm: 'mx-2',
  md: 'mx-4 md:mx-6',
  lg: 'mx-6 md:mx-8 lg:mx-12',
}

/**
 * Divider Component
 * Visual separator for content sections
 */
export function Divider({
  className = '',
  vertical = false,
  margin = 'md',
}: DividerProps) {
  if (vertical) {
    return (
      <div className={`
        w-px h-full
        bg-slate-200 dark:bg-slate-800
        ${verticalMarginClasses[margin]}
        ${className}
      `} />
    )
  }

  return (
    <hr className={`
      border-0 h-px
      bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent
      ${marginClasses[margin]}
      ${className}
    `} />
  )
}
