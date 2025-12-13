/**
 * Design System - Centralized UX/UI consistency tokens
 * All components and pages should reference this file for consistent styling
 */

// Typography scale - responsive text sizing
export const typography = {
  display: {
    lg: "text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight font-serif",
    md: "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-serif",
    sm: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-serif",
  },
  heading: {
    h1: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight",
    h2: "text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight",
    h3: "text-xl sm:text-2xl font-semibold",
    h4: "text-lg sm:text-xl font-semibold",
  },
  body: {
    lg: "text-lg leading-relaxed",
    base: "text-base leading-relaxed",
    sm: "text-sm leading-relaxed",
    xs: "text-xs leading-relaxed",
  },
  label: "text-sm font-medium text-muted-foreground",
  caption: "text-xs text-muted-foreground",
}

// Spacing scale - consistent padding/margin
export const spacing = {
  xs: "gap-2 px-2 py-2",
  sm: "gap-3 px-3 py-3",
  md: "gap-4 px-4 py-4",
  lg: "gap-6 px-6 py-6",
  xl: "gap-8 px-8 py-8",
  
  // Specific gap values
  gapXs: "gap-2",
  gapSm: "gap-3",
  gapMd: "gap-4",
  gapLg: "gap-6",
  gapXl: "gap-8",
  
  // Page/section padding
  pageX: "px-4 sm:px-6 md:px-8 lg:px-12",
  pageY: "py-6 sm:py-8 md:py-12 lg:py-16",
  pagePadding: "px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12 lg:py-16",
  
  // Container widths
  container: {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  }
}

// Color & Gradient system
export const gradients = {
  hero: "bg-gradient-to-r from-primary via-primary/50 to-primary/30 dark:from-primary/80 dark:to-primary/40",
  heroVertical: "bg-gradient-to-b from-primary/10 to-transparent",
  card: "bg-gradient-to-br from-primary/5 to-transparent",
  accent: "bg-gradient-to-r from-primary to-primary/70",
  
  // Admin dashboard stats
  stats: {
    primary: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-l-4 border-blue-500",
    secondary: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-l-4 border-amber-500",
    success: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-l-4 border-green-500",
    warning: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-l-4 border-yellow-500",
  },
  
  // Interactive elements
  buttonHover: "hover:bg-gradient-to-r hover:from-primary/90 hover:to-primary/70",
}

// Responsive grid layouts
export const responsive = {
  pageContainer: "container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-6xl w-full",
  sectionPadding: "py-6 sm:py-8 md:py-12 lg:py-16",
  
  grid: {
    cols1: "grid grid-cols-1 gap-4",
    cols2: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
    cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
    cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6",
  },
  
  textResponsive: {
    h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    h2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
    h3: "text-xl sm:text-2xl md:text-3xl",
    body: "text-sm sm:text-base md:text-lg",
  }
}

// Interactive states - for buttons, links, forms
export const interactive = {
  transition: "transition-all duration-200 ease-in-out",
  transitionFast: "transition-all duration-150 ease-in-out",
  transitionSlow: "transition-all duration-300 ease-in-out",
  
  focusRing: "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background",
  focusRingLarge: "focus:outline-none focus:ring-4 focus:ring-primary/30",
  
  // Hover states
  hoverScale: "hover:scale-105",
  hoverBrighten: "hover:brightness-110 dark:hover:brightness-125",
  hoverElevate: "hover:shadow-lg hover:shadow-primary/10",
  
  // Active states
  activeScale: "active:scale-95",
  activeOpacity: "active:opacity-80",
  
  buttonBase: "font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
  
  linkBase: "text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors",
  linkSoft: "text-primary/70 hover:text-primary transition-colors",
}

// Shadows
export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  
  // Primary color shadows
  primary: "shadow-lg shadow-primary/20 dark:shadow-primary/10",
  primarySmall: "shadow-md shadow-primary/15 dark:shadow-primary/5",
}

// Border styles
export const borders = {
  light: "border border-border/50",
  normal: "border border-border",
  focus: "border border-primary/30 focus:border-primary",
  error: "border border-destructive focus:ring-destructive/50",
  success: "border border-green-500 focus:ring-green-500/50",
}

// Card styles - reusable card patterns
export const cards = {
  base: "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
  elevated: "rounded-lg border border-border bg-card text-card-foreground shadow-lg transition-all duration-200 hover:shadow-xl",
  interactive: "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-95",
  gradient: "rounded-lg border-0 bg-gradient-to-br from-primary/5 to-transparent text-card-foreground shadow-sm transition-all duration-200",
  flat: "rounded-lg bg-card text-card-foreground border-0 shadow-none transition-all duration-200",
}

// Form elements
export const forms = {
  input: "flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-base placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
  inputError: "border-destructive focus:ring-destructive/50 focus:border-destructive",
  inputSuccess: "border-green-500 focus:ring-green-500/50 focus:border-green-500",
  
  textarea: "flex min-h-24 w-full rounded-lg border border-input bg-background px-4 py-2 text-base placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  
  label: "block text-sm font-medium text-foreground mb-1.5",
  helperText: "text-xs text-muted-foreground mt-1",
  errorText: "text-xs text-destructive mt-1",
}

// Button styles - for consistency
export const buttons = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:pointer-events-none disabled:opacity-50",
  
  sizes: {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
  },
  
  variants: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-95",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary/50",
    ghost: "hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-2 focus:ring-secondary/50",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/50",
    subtle: "text-muted-foreground hover:text-foreground hover:bg-accent/50 focus:ring-2 focus:ring-primary/50",
    link: "text-primary underline-offset-4 hover:underline focus:ring-2 focus:ring-primary/50",
  }
}

// Common layout patterns
export const layout = {
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexColumn: "flex flex-col",
  flexColumnCenter: "flex flex-col items-center justify-center",
}

// Accessibility - always apply these
export const a11y = {
  focusVisible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
  skipLink: "absolute -top-40 left-0 z-50 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md focus:top-4",
  srOnly: "sr-only",
}
