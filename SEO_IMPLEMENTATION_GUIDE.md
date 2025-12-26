# SEO Audit - Implementation Guide

## 🚀 Quick Fix Commands

### Priority 1: Fix Placeholder Values

**Location:** `app/blog/[slug]/page.tsx` (Line 57)

**Current:**
```typescript
creator: "@yourhandle",
```

**Change to:**
```typescript
creator: siteConfig.socialMedia.twitter,
```

**Import Required:**
```typescript
import { siteConfig } from "@/lib/seo"
```

---

**Location:** `app/recipes/[slug]/page.tsx` (Line 54)

**Same fix required**

---

### Priority 2: Add /ai-chef to Sitemap

**Location:** `app/sitemap.ts` (after line 68)

**Add:**
```typescript
{
  url: `${siteUrl}/ai-chef`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.85,
},
{
  url: `${siteUrl}/favorites`,
  lastModified: new Date(),
  changeFrequency: "daily" as const,
  priority: 0.8,
},
```

---

### Priority 3: Create Metadata for /ai-chef

**Create new file:** `app/ai-chef/layout.tsx`

```typescript
import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "AI Chef - Generate Custom Recipes with AI | World Food Recipes",
  description: "Generate personalized recipes using AI. Describe your ingredients and dietary preferences, and let our AI Chef create delicious recipes just for you instantly.",
  url: getCanonicalUrl('/ai-chef'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function AiChefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

---

### Priority 4: Fix Twitter Creator in Blog/Recipe Pages

**File:** `app/blog/[slug]/page.tsx` (Line 1)

**Add import:**
```typescript
import { siteConfig } from "@/lib/seo"
```

**File:** `app/recipes/[slug]/page.tsx` (Line 1)

**Add import:**
```typescript
import { siteConfig } from "@/lib/seo"
```

---

## Recipe Schema Implementation

### Step 1: Update lib/seo.ts

**Add function call in recipe pages metadata:**

```typescript
// In app/recipes/[slug]/page.tsx generateMetadata()

// Add this in the return statement:
scripts: [
  {
    type: "application/ld+json",
    children: JSON.stringify(
      recipeSchema({
        name: recipe.title,
        description: recipe.excerpt || recipe.content.substring(0, 160),
        image: recipe.image || `${siteUrl}/og-image.svg`,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: calculateTotalTime(recipe.prepTime, recipe.cookTime),
        servings: recipe.servings ? parseInt(recipe.servings) : 4,
        author: recipe.author || siteConfig.name,
        datePublished: recipe.date,
        cuisine: recipe.tags?.[0] || "International",
        mealType: recipe.tags?.[1] || "Main Course",
      })
    ),
  },
],
```

### Step 2: Parse Recipe Data

Ensure recipe objects include these fields:
- title ✅
- excerpt ✅
- content ✅
- image ✅
- prepTime (needs to be added)
- cookTime (needs to be added)
- servings (needs to be added)
- date ✅
- author ✅
- tags ✅

---

## Search Parameter Handling

### Update app/robots.ts

**Current:**
```typescript
rules: [
  {
    userAgent: "*",
    allow: ["/"],
    disallow: ["/admin", "/admin/*", "/api/*"],
  },
],
```

**Change to:**
```typescript
rules: [
  {
    userAgent: "*",
    allow: ["/"],
    disallow: ["/admin", "/admin/*", "/api/*", "/search?"],
  },
],
```

---

## Image Optimization

### Update OG Image Configuration

**Create optimized images:**
1. Convert `/public/og-image.png` to WebP format
2. Add `next/image` for dynamic images
3. Update descriptions with alt text

**Example enhancement in metadata:**

```typescript
openGraph: {
  images: [
    {
      url: `${siteUrl}/og-image.png`,
      width: 1200,
      height: 630,
      alt: "World Food Recipes - Authentic international recipes from around the world",
      type: "image/png",
    },
  ],
},
```

---

## Testing Checklist

After implementing fixes, verify:

- [ ] Run `pnpm build` - should complete without errors
- [ ] Check `/sitemap.xml` - should include /ai-chef and /favorites
- [ ] Test OpenGraph - use [Facebook OG Debugger](https://developers.facebook.com/tools/debug/og/object)
- [ ] Test Twitter Card - use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Validate Schema - use [Schema.org Validator](https://validator.schema.org/)
- [ ] Test Recipe Rich Snippet - use [Google Rich Results Tester](https://search.google.com/test/rich-results)

---

## Verification Commands

```bash
# Build and check for errors
pnpm build

# Check sitemap is generated correctly
curl https://yourdomain.com/sitemap.xml | head -50

# Verify robots.txt
curl https://yourdomain.com/robots.txt

# Check specific page metadata (dev environment)
curl http://localhost:3000/ai-chef -H "Accept: text/html" | grep -i "og:title"
```

---

## Expected Timeline

| Phase | Tasks | Time | Impact |
|-------|-------|------|--------|
| 1 | Fix placeholders, add to sitemap, /ai-chef metadata | 1-2 hours | +15-20% traffic |
| 2 | Recipe schema, image optimization | 2-3 hours | +10-15% traffic |
| 3 | Advanced schema, analytics | 2-4 hours | +5-10% traffic |

---

**Total Implementation Time:** 5-9 hours for full optimization  
**Expected Results:** 30-45% organic traffic increase within 30 days

