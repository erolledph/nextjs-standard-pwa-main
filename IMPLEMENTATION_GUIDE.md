# Design System Implementation Guide

This guide shows how to use the new reusable components to standardize all pages, following rice-bowl's architecture.

## Quick Start

### Import Components
```tsx
// Layout components
import { Page, Section, Container, Hero, Grid, GridItem, Flex, Stack } from '@/components/layout'

// UI components
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { Divider } from '@/components/ui/Divider'

// Loading components
import { CardSkeleton, GridSkeleton, ListSkeleton, DetailSkeleton } from '@/components/ui/skeleton'
```

## Page Structure Examples

### Example 1: Simple List Page (Blog, Recipes, Videos)

```tsx
'use client'

import { useState } from 'react'
import { Page, Section, Container, Hero, Grid, GridItem } from '@/components/layout'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { GridSkeleton } from '@/components/ui/skeleton'

export default function RecipesPage() {
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState([])

  return (
    <Page>
      {/* Hero Section */}
      <Hero
        subtitle="Explore"
        title="Amazing Recipes"
        description="Discover delicious recipes from around the world"
        align="center"
      />

      <Section>
        {loading ? (
          <GridSkeleton count={6} columns={3} />
        ) : (
          <Grid columns={3} gap="lg">
            {recipes.map((recipe) => (
              <GridItem key={recipe.id}>
                <Card hover>
                  <CardHeader>
                    <h3 className="font-bold text-lg">{recipe.title}</h3>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {recipe.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="primary" size="sm">
                        {recipe.category}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {recipe.time} min
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        )}
      </Section>
    </Page>
  )
}
```

### Example 2: Detail/Article Page (Blog Post, Recipe Detail)

```tsx
'use client'

import { useState } from 'react'
import { Page, Section, Container, Hero, Grid, GridItem, Flex, Stack } from '@/components/layout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { Divider } from '@/components/ui/Divider'
import { DetailSkeleton } from '@/components/ui/skeleton'

export default function BlogPostPage({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  const [post, setPost] = useState(null)

  if (loading) {
    return (
      <Page>
        <Section>
          <DetailSkeleton />
        </Section>
      </Page>
    )
  }

  return (
    <Page>
      {/* Hero Section */}
      <Hero
        title={post?.title}
        description={post?.excerpt}
      />

      <Section>
        <Grid columns={3} gap="lg">
          {/* Main Content - Spans 2 columns on desktop */}
          <GridItem span={2}>
            <Stack gap="lg">
              {/* Featured Image */}
              <img
                src={post?.image}
                alt={post?.title}
                className="w-full h-96 object-cover rounded-lg"
              />

              {/* Meta Information */}
              <Flex gap="md" wrap>
                <Badge variant="primary">
                  {post?.category}
                </Badge>
                <Badge variant="default">
                  {post?.author}
                </Badge>
                <Badge variant="default">
                  {post?.date}
                </Badge>
              </Flex>

              <Divider margin="lg" />

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none">
                {/* Your markdown/HTML content */}
              </div>
            </Stack>
          </GridItem>

          {/* Sidebar - 1 column on desktop */}
          <GridItem span={1}>
            <Card>
              <CardHeader>
                <h3 className="font-bold">Related Articles</h3>
              </CardHeader>
              <CardBody>
                {/* Related items */}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Section>
    </Page>
  )
}
```

### Example 3: Form Page (Contact, Admin)

```tsx
'use client'

import { useState } from 'react'
import { Page, Section, Hero, Stack, Flex } from '@/components/layout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { Divider } from '@/components/ui/Divider'

export default function ContactPage() {
  const [formData, setFormData] = useState({})

  return (
    <Page>
      <Hero
        title="Get in Touch"
        description="We'd love to hear from you. Send us a message!"
        align="center"
      />

      <Section>
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Contact Form</h2>
          </CardHeader>

          <Divider margin="md" />

          <CardBody>
            <Stack gap="md">
              {/* Form fields */}
            </Stack>
          </CardBody>

          <Divider margin="md" />

          <CardFooter>
            <Flex justify="between">
              <button>Cancel</button>
              <button>Send</button>
            </Flex>
          </CardFooter>
        </Card>
      </Section>
    </Page>
  )
}
```

## Component Hierarchy Reference

```
Page
  └── Hero (optional header)
  └── Section (content wrapper)
      ├── Container (optional inner wrapper)
      ├── Grid
      │   ├── GridItem
      │   │   └── Card
      │   │       ├── CardHeader
      │   │       ├── CardBody
      │   │       └── CardFooter
      │   └── ...
      ├── Flex/Stack (for alignment)
      ├── Divider
      └── Badge
```

## Migration Checklist

- [ ] Update home page with Hero + Grid components
- [ ] Update blog list page with GridSkeleton
- [ ] Update blog detail page with DetailSkeleton
- [ ] Update recipe list page with GridSkeleton
- [ ] Update recipe detail page with DetailSkeleton
- [ ] Update videos page with GridSkeleton
- [ ] Update search page with Grid layout
- [ ] Update favorites page with Grid layout
- [ ] Update admin dashboard with Card components
- [ ] Update contact page with Card + Stack
- [ ] Update all static pages (privacy, terms, etc)
- [ ] Test dark mode on all pages
- [ ] Test responsiveness (mobile, tablet, desktop)

## Styling Notes

### Spacing System
- **Small**: `gap-2` or `py-2`
- **Medium**: `gap-4` or `py-4` (default)
- **Large**: `gap-6` or `py-6`
- **XL**: `gap-8` or `py-8`

### Colors
- **Primary**: Orange (`orange-600`, `orange-400` dark)
- **Neutral**: Slate (`slate-900`, `slate-50` dark)
- **Borders**: Slate-200 light, slate-800 dark

### Responsive Prefixes
- `sm:` - 640px and above
- `md:` - 768px and above
- `lg:` - 1024px and above
- `xl:` - 1280px and above

## Best Practices

1. **Always wrap pages with `Page` component**
2. **Use `Section` for major content blocks**
3. **Use `Grid` for item collections**
4. **Use `Stack` for vertical content**
5. **Use `Flex` for horizontal alignment**
6. **Apply `hover` prop to interactive cards**
7. **Use appropriate `Badge` variants**
8. **Show `GridSkeleton` while loading**
9. **Keep card content consistent**
10. **Test responsive layout at different breakpoints**

## Performance Tips

- Use `CardSkeleton` for individual loading states
- Use `GridSkeleton` for multiple items
- Use `DetailSkeleton` for full page loading
- Wrap images in `<picture>` for optimization
- Use Next.js `Image` component when possible
- Lazy load offscreen components

---

For more details, see `COMPONENT_DESIGN_SYSTEM.md`
