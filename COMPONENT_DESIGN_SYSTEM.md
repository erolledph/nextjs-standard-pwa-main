# Component Design System

This document outlines the reusable component structure for consistent page layouts throughout the application, inspired by rice-bowl's architecture.

## Layout Components

### Page
Wraps entire page content with consistent structure.
```tsx
import { Page } from '@/components/layout'

export default function MyPage() {
  return (
    <Page>
      <Hero title="Hello World" />
      <Section>
        {/* Your content here */}
      </Section>
    </Page>
  )
}
```

### Section
Provides consistent spacing and max-width for content sections.
```tsx
import { Section } from '@/components/layout'

<Section className="mb-8">
  {/* Content */}
</Section>
```

### Container
Wrapper for constrained max-width content.
```tsx
import { Container } from '@/components/layout'

<Container>
  {/* Content stays within max-width-screen-lg */}
</Container>
```

### Hero
Consistent header section for pages with title, subtitle, and description.
```tsx
import { Hero } from '@/components/layout'

<Hero 
  subtitle="Welcome"
  title="Amazing Recipes"
  description="Discover delicious recipes from around the world"
  align="center"
/>
```

### Grid / GridItem
Responsive grid layout system.
```tsx
import { Grid, GridItem } from '@/components/layout'

<Grid columns={3} gap="lg">
  <GridItem span={1}>
    {/* Card 1 */}
  </GridItem>
  <GridItem span={1}>
    {/* Card 2 */}
  </GridItem>
  <GridItem span={2}>
    {/* Spans 2 columns on tablet+ */}
  </GridItem>
</Grid>
```

## UI Components

### Card
Reusable card container with header, body, and footer slots.
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
  <CardFooter>
    {/* Action buttons */}
  </CardFooter>
</Card>
```

## Design Principles

1. **Consistency**: All pages use the same component structure
2. **Reusability**: Components are flexible and composable
3. **Responsive**: Mobile-first design with Tailwind breakpoints
4. **Dark Mode**: Full dark mode support throughout
5. **Performance**: Server components where possible

## Spacing System

- **Section**: `py-8 md:py-12 lg:py-20`
- **Gap (sm)**: `gap-4`
- **Gap (md)**: `gap-6` (default)
- **Gap (lg)**: `gap-8`

## Color System

- **Primary**: `orange-600` / `orange-400` (dark mode)
- **Slate**: `slate-900` / `slate-50` (dark mode)
- **Background**: `white` / `slate-900` (dark mode)
- **Border**: `slate-200` / `slate-800` (dark mode)

## Responsive Breakpoints

- `sm`: 640px
- `md`: 768px  
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Migration Guide

When updating pages to use standardized components:

1. Wrap page content with `Page` component
2. Use `Section` to group related content
3. Use `Hero` for page headers
4. Replace custom cards with reusable `Card` component
5. Use `Grid` for item collections
6. Import from `@/components/layout` index
