# 🛠️ SEO TECHNICAL IMPLEMENTATION GUIDE

**Target:** Implement critical SEO fixes to boost organic traffic  
**Timeline:** Week 1 (Quick Wins), 90 Days (Full Implementation)  
**Difficulty:** Beginner to Intermediate

---

## 📋 PART 1: RECIPE SCHEMA IMPLEMENTATION (CRITICAL)

### Step 1: Understand Recipe Schema Structure
```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Recipe Title",
  "description": "What this recipe is about",
  "image": "https://example.com/image.jpg",
  "author": {
    "@type": "Organization",
    "name": "World Food Recipes"
  },
  "prepTime": "PT15M",          // PrepTime (ISO 8601 format)
  "cookTime": "PT30M",          // CookTime (ISO 8601 format)
  "totalTime": "PT45M",         // Total time
  "recipeYield": "4 servings",  // Number of servings
  "recipeIngredient": [
    "2 cups flour",
    "1 egg"
  ],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "position": 1,
      "text": "Mix ingredients..."
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "245"
  }
}
```

### Step 2: Locate Recipe Post Component
**File:** `components/pages/recipes/RecipePost.tsx`

### Step 3: Import Schema Function
```tsx
import { recipeSchema } from "@/lib/seo"
```

### Step 4: Add JSON-LD Script to Component
Add this inside your RecipePost component's return JSX:

```tsx
export function RecipePost({ recipe }: RecipePostProps) {
  // ... existing code ...

  return (
    <>
      {/* Add JSON-LD schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            recipeSchema({
              name: recipe.title,
              description: recipe.excerpt || recipe.content.substring(0, 160),
              image: recipe.image || `${siteUrl}/og-image.png`,
              prepTime: recipe.prepTime ? `PT${recipe.prepTime}` : undefined,
              cookTime: recipe.cookTime ? `PT${recipe.cookTime}` : undefined,
              totalTime: recipe.totalTime ? `PT${recipe.totalTime}` : undefined,
              servings: parseInt(recipe.servings) || 4,
              ingredients: recipe.ingredients || [],
              instructions: recipe.instructions || [],
              author: recipe.author || "World Food Recipes",
              datePublished: recipe.date,
              cuisine: recipe.cuisine,
              mealType: recipe.mealType,
            })
          ),
        }}
        key="recipe-schema"
      />

      {/* Rest of component JSX */}
      <article>
        {/* ... recipe content ... */}
      </article>
    </>
  )
}
```

### Step 5: Ensure Recipe Data Structure
Make sure your recipe object has these fields:
```typescript
interface Recipe {
  id: string
  title: string                    // Recipe name
  slug: string
  excerpt?: string                 // Short description
  content: string                  // Full content/instructions
  date: string                     // Publication date (ISO 8601)
  author?: string                  // Chef name
  image?: string                   // Recipe photo URL
  prepTime?: string                // e.g., "15 mins"
  cookTime?: string                // e.g., "30 mins"
  totalTime?: string               // e.g., "45 mins"
  servings?: string                // e.g., "4"
  ingredients?: string[]           // ["2 cups flour", "1 egg"]
  instructions?: string[]          // ["Step 1...", "Step 2..."]
  cuisine?: string                 // e.g., "Italian"
  mealType?: string                // e.g., "dessert"
  difficulty?: string              // e.g., "Easy"
  tags?: string[]
}
```

### Step 6: Test Implementation
1. Deploy changes to production
2. Go to [Google Rich Results Tester](https://search.google.com/test/rich-results)
3. Paste URL of a recipe page
4. Click "Test" button
5. Verify:
   - ✅ No validation errors
   - ✅ Recipe card preview shows correctly
   - ✅ All key fields present

**Expected Result:**
```
✅ Recipe found
✅ Name: "Beef Wellington"
✅ Serves: "4"
✅ Prep time: "30 mins"
✅ Cook time: "45 mins"
✅ Instructions: "12 steps"
```

### Step 7: Submit to Google
1. Go to Google Search Console
2. Go to Enhancements > Rich Results
3. Submit URLs for re-indexing
4. Wait 1-2 weeks for Google to show recipe snippets

---

## 📋 PART 2: AUTHOR PAGES IMPLEMENTATION

### Step 1: Create Author Data Structure
Create new file: `lib/authors.ts`

```typescript
export interface AuthorData {
  id: string
  name: string
  slug: string
  bio: string                    // 100-150 words
  expertise: string              // Cooking specialty
  image?: string                 // Author photo
  credentials?: string[]         // ["Le Cordon Bleu", "10+ years experience"]
  socialLinks?: {
    twitter?: string
    instagram?: string
    email?: string
  }
  recipes?: string[]             // Array of recipe slugs
  posts?: string[]               // Array of blog post slugs
}

// Mock data - replace with real authors
export const authors: AuthorData[] = [
  {
    id: "1",
    name: "Sarah Chef",
    slug: "sarah-chef",
    bio: "Sarah is a professional chef with 15 years of international cooking experience. She specializes in French and Italian cuisines.",
    expertise: "French & Italian Cuisine",
    credentials: ["Le Cordon Bleu Graduate", "15 years professional chef"],
    socialLinks: {
      twitter: "https://twitter.com/sarahchef",
      instagram: "https://instagram.com/sarahchef",
    },
  },
]

export function getAuthorBySlug(slug: string): AuthorData | undefined {
  return authors.find(a => a.slug === slug)
}
```

### Step 2: Create Author Page Layout
Create: `app/authors/layout.tsx`

```tsx
import type { Metadata } from "next"
import { siteConfig } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = {
  title: "Food Experts & Recipe Authors - World Food Recipes",
  description: "Meet the expert chefs and food bloggers behind World Food Recipes.",
  openGraph: {
    title: "Food Experts & Recipe Authors",
    description: "Meet our team of professional chefs and recipe developers.",
    url: `${siteUrl}/authors`,
    type: "website",
  },
}

export default function AuthorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

### Step 3: Create Individual Author Pages
Create: `app/authors/[author]/page.tsx`

```tsx
import { getAuthorBySlug } from "@/lib/authors"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>
}): Promise<Metadata> {
  const { author } = await params
  const authorData = getAuthorBySlug(author)

  if (!authorData) {
    return {
      title: "Author Not Found",
    }
  }

  return {
    title: `${authorData.name} - Recipe Author | World Food Recipes`,
    description: authorData.bio,
    openGraph: {
      title: `${authorData.name} - Recipe Author`,
      description: authorData.bio,
      url: `${siteUrl}/authors/${author}`,
      type: "profile",
      images: authorData.image
        ? [
            {
              url: authorData.image,
              width: 400,
              height: 400,
              alt: authorData.name,
            },
          ]
        : undefined,
    },
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ author: string }>
}) {
  const { author } = await params
  const authorData = getAuthorBySlug(author)

  if (!authorData) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Author Not Found</h1>
        <Link href="/authors" className="text-primary hover:underline">
          ← Back to Authors
        </Link>
      </div>
    )
  }

  return (
    <main className="container py-12">
      <div className="max-w-3xl mx-auto">
        {/* Author Header */}
        <div className="text-center mb-12">
          {authorData.image && (
            <Image
              src={authorData.image}
              alt={authorData.name}
              width={150}
              height={150}
              className="rounded-full mx-auto mb-6"
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{authorData.name}</h1>
          <p className="text-xl text-primary mb-4">{authorData.expertise}</p>

          {/* Social Links */}
          {authorData.socialLinks && (
            <div className="flex gap-4 justify-center mb-6">
              {authorData.socialLinks.twitter && (
                <a
                  href={authorData.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Twitter
                </a>
              )}
              {authorData.socialLinks.instagram && (
                <a
                  href={authorData.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Instagram
                </a>
              )}
            </div>
          )}
        </div>

        {/* Author Bio */}
        <div className="prose dark:prose-invert max-w-none mb-12">
          <h2>About {authorData.name}</h2>
          <p>{authorData.bio}</p>

          {authorData.credentials && (
            <>
              <h3>Credentials</h3>
              <ul>
                {authorData.credentials.map((cred, i) => (
                  <li key={i}>{cred}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Author's Recipes */}
        {authorData.recipes && authorData.recipes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Recipes by {authorData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Map and display author's recipes */}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
```

### Step 4: Add Author Link to Recipe Pages
In your recipe post/card component, add:

```tsx
{recipe.author && (
  <div className="author-credit mt-4 p-4 bg-muted rounded">
    <p className="text-sm text-muted-foreground mb-2">By</p>
    <Link
      href={`/authors/${slugifyAuthorName(recipe.author)}`}
      className="text-lg font-semibold text-primary hover:underline"
    >
      {recipe.author}
    </Link>
  </div>
)}
```

---

## 📋 PART 3: BREADCRUMB IMPLEMENTATION

### Step 1: Create Breadcrumb Component
Create: `components/common/Breadcrumb.tsx`

```tsx
import Link from "next/link"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="mx-2">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

### Step 2: Create Breadcrumb Schema Helper
Add to `lib/seo.ts`:

```typescript
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
```

### Step 3: Use in Recipe Pages
```tsx
import { Breadcrumb, breadcrumbSchema } from "@/lib/seo"

export function RecipePost({ recipe }: RecipePostProps) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Recipes", href: "/recipes" },
    { label: recipe.title },
  ]

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: `${siteUrl}/` },
              { name: "Recipes", url: `${siteUrl}/recipes` },
              { name: recipe.title, url: `${siteUrl}/recipes/${recipe.slug}` },
            ])
          ),
        }}
      />

      <article>
        <Breadcrumb items={breadcrumbItems} />
        {/* Rest of recipe content */}
      </article>
    </>
  )
}
```

---

## 📋 PART 4: IMAGE OPTIMIZATION

### Step 1: Improve Alt Text
```tsx
// BEFORE:
alt={`${title} - Recipe | World Food Recipes`}

// AFTER:
alt={`${title} - ${difficulty} recipe with ${prepTime} prep time`}

// EXAMPLE:
alt="Beef Wellington - Easy recipe with 30 minutes prep time"
```

### Step 2: Add Image Dimensions
```tsx
<img
  src={recipe.image}
  alt={`${recipe.title} - Easy recipe with ${prepTime}`}
  width={800}
  height={600}
  className="w-full h-auto"
/>
```

### Step 3: Use Next.js Image (Recommended)
```tsx
import Image from "next/image"

<Image
  src={recipe.image}
  alt={`${recipe.title} - Easy recipe`}
  width={800}
  height={600}
  priority={isAboveTheFold}
  quality={85}
  className="w-full h-auto"
/>
```

---

## 📋 PART 5: INTERNAL LINKING STRATEGY

### Step 1: Add Related Recipes Section
Create: `components/recipes/RelatedRecipes.tsx`

```tsx
import Link from "next/link"
import { RecipePostCard } from "@/components/blog/RecipePostCard"

interface RelatedRecipesProps {
  currentSlug: string
  tags: string[]
  limit?: number
}

export async function RelatedRecipes({
  currentSlug,
  tags,
  limit = 3,
}: RelatedRecipesProps) {
  // Fetch recipes with matching tags (excluding current)
  const recipes = await getRecipesByTags(tags, currentSlug, limit)

  if (recipes.length === 0) return null

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6">Related Recipes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipePostCard key={recipe.id} {...recipe} />
        ))}
      </div>
    </section>
  )
}
```

### Step 2: Add Tag Links
```tsx
{recipe.tags && recipe.tags.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-6">
    {recipe.tags.map((tag) => (
      <Link
        key={tag}
        href={`/tags/${tag}`}
        className="px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors text-sm"
      >
        {tag}
      </Link>
    ))}
  </div>
)}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Week 1 (Critical)
- [ ] Implement Recipe Schema JSON-LD
- [ ] Test with Google Rich Results
- [ ] Fix Twitter creator handle
- [ ] Create author data structure
- [ ] Create author pages

### Week 2-3
- [ ] Add breadcrumb component
- [ ] Improve image alt text
- [ ] Add related recipes section
- [ ] Test all changes
- [ ] Set up analytics

### Week 4+
- [ ] Expand recipe content
- [ ] Build topical clusters
- [ ] Begin link building
- [ ] Monitor rankings
- [ ] Monthly reviews

---

## 🧪 TESTING PROCEDURES

### Schema Validation
1. Go to https://search.google.com/test/rich-results
2. Paste recipe URL
3. Verify: No errors, correct fields, preview looks good

### Structured Data Testing
1. Go to https://validator.schema.org
2. Paste source code
3. Verify: No errors, all required fields present

### SEO Testing
1. Check mobile-friendliness: https://search.google.com/test/mobile-friendly
2. Check page speed: https://pagespeed.web.dev
3. Check lighthouse score: Press F12 → Lighthouse

### Metadata Testing
1. Twitter Card: https://cards-dev.twitter.com/validator
2. Open Graph: Paste URL in Facebook Debugger
3. Google Rich Results: https://search.google.com/test/rich-results

---

## 🚀 DEPLOYMENT

### Before Publishing:
- [ ] All tests pass
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Images optimized

### Publishing:
```bash
# Commit changes
git add .
git commit -m "feat: Add Recipe Schema, Author Pages, Breadcrumbs"

# Push to production
git push origin main

# Monitor in Google Search Console
# Go to Enhancements > Rich Results
# Submit URLs for re-indexing
```

### After Publishing:
- [ ] Monitor Google Search Console for errors
- [ ] Check rich result indexing (2-4 weeks)
- [ ] Monitor ranking changes (weekly)
- [ ] A/B test with Google Analytics

---

## 📞 TROUBLESHOOTING

### "Schema validation failed"
- Check JSON syntax
- Ensure all required fields present
- Use https://jsonlint.com to validate

### "Rich results not showing"
- Wait 2-4 weeks for Google to index
- Submit URLs in Google Search Console
- Check "Rich result report" for issues

### "Images not loading"
- Check image URL is public
- Verify CORS headers
- Use absolute URLs (not relative)

### "Author pages not ranking"
- Ensure author pages have unique meta tags
- Add internal links to author pages
- Create author schema markup

---

**Document Status:** Complete  
**Last Updated:** December 13, 2025  
**Next Review:** After implementation (1 week)

🚀 **Ready to implement? Start with Recipe Schema. It's the highest ROI change you can make.**
