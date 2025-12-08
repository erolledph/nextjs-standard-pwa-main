# Blog/Recipe Codebase Structure Analysis

## 1. Directory Structure for Content

### Markdown File Locations
```
posts/
├── blog/                           # Blog articles (11 files)
│   ├── art-of-knife-skills.md
│   ├── asian-umami-flavors.md
│   ├── baking-science.md
│   ├── chocolate-tempering.md
│   ├── essential-spices.md
│   ├── fermentation-101.md
│   ├── grilled-fish.md
│   ├── mastering-italian-pasta.md
│   ├── perfect-risotto.md
│   ├── perfect-stock-broth.md
│   └── sous-vide-cooking.md
│
└── recipes/                        # Recipe articles (7 files)
    ├── beef-stir-fry.md
    ├── burger-steak.md
    ├── ces.md
    ├── chicken-adobo.md
    ├── creamy-mushroom-pasta.md
    ├── lemon-garlic-salmon.md
    └── vegetable-curry.md
```

### App Route Structure
```
app/
├── blog/
│   └── [slug]/
│       └── page.tsx                # Blog post detail page
├── recipes/
│   └── [slug]/
│       └── page.tsx                # Recipe detail page
└── api/
    ├── posts/
    │   ├── route.ts                # GET/POST all blog posts
    │   ├── [slug]/                 # Individual post operations
    │   ├── delete/                 # Delete post endpoint
    │   └── update/                 # Update post endpoint
    └── recipes/
        ├── route.ts                # GET/POST all recipes
        ├── delete/                 # Delete recipe endpoint
        └── update/                 # Update recipe endpoint
```

---

## 2. Content Loading & Parsing System

### Main Utility: `lib/github.ts`

#### Key Functions:

**`fetchContentFromGitHub(owner, repo, token, contentType)`**
- Generic function that loads either "blog" or "recipes" content
- Loads from `posts/blog` or `posts/recipes` directories
- **Development mode**: Reads files directly from filesystem
- **Production mode**: Fetches from GitHub API with base64 decoding
- Implements 5-minute caching for performance
- Returns sorted array by date (newest first)

**`fetchPostsFromGitHub(owner, repo, token)`**
- Legacy wrapper for blog posts (calls `fetchContentFromGitHub` with "blog")
- Maintained for backwards compatibility

**`parseMarkdownContent(filename, content, contentType)`**
- Extracts YAML frontmatter from markdown files
- Handles both blog and recipe-specific fields
- Returns parsed `BlogPost` or `Recipe` object

#### Markdown Parsing Details:
- Uses regex: `/^---\n([\s\S]*?)\n---\n([\s\S]*)$/`
- Extracts frontmatter between `---` delimiters
- Simple YAML parsing (key: value format)
- Returns complete `BlogPost` or `Recipe` interface

#### Caching Strategy:
- **Cache key format**: `github:{contentType}:{owner}:{repo}`
- **TTL**: 5 minutes (300,000ms)
- Falls back to GitHub API when cache misses
- Uses `lib/cache.ts` for caching logic

---

## 3. Card Components for Display

### Blog Post Card: `components/blog/BlogPostCard.tsx`
**Props:**
- `id`: string
- `title`: string
- `slug`: string
- `excerpt`: string (optional)
- `date`: string
- `author`: string (optional)
- `tags`: string[] (optional)
- `image`: string (optional)
- `content`: string (optional) - used to calculate reading time
- `titleSize`: "small" | "medium" | "large"
- `showFullDate`: boolean

**Features:**
- Calculates reading time from content using `calculateReadingTime()`
- Date formatting (short or full format)
- Hover animations (image scale, border highlight)
- Responsive image container (h-48 on mobile, h-56 on desktop)
- Tag display
- Link to `/blog/{slug}`

### Recipe Post Card: `components/blog/RecipePostCard.tsx`
**Props:**
- `id`: string
- `title`: string
- `slug`: string
- `excerpt`: string (optional)
- `date`: string
- `author`: string (optional)
- `tags`: string[] (optional)
- `image`: string (optional)
- `prepTime`: string (optional)
- `cookTime`: string (optional)
- `servings`: string (optional)
- `difficulty`: string (optional)
- `isFavorited`: boolean
- `onToggleFavorite`: callback

**Features:**
- Displays recipe-specific metadata (prep time, cook time, servings)
- Difficulty level badge with color coding:
  - Easy: Green (orange-100)
  - Medium: Yellow (yellow-100)
  - Hard: Red (red-100)
- Favorite heart icon (toggleable)
- Link to `/recipes/{slug}`
- Uses Lucide icons (Clock, Users, ChefHat, Heart)

### Other Components:
- `BlogPostCardSkeleton.tsx` - Loading skeleton for blog cards
- `RecipePostCardSkeleton.tsx` - Loading skeleton for recipe cards
- `BlogPostSkeleton.tsx` - Loading skeleton for full blog posts
- `VideoCard.tsx` - Card component for videos (unrelated but same directory)

---

## 4. Blog Post vs Recipe Post Structure

### Blog Post Frontmatter (Example: `fermentation-101.md`)
```yaml
---
title: Fermentation 101 - Preserve and Enhance Your Foods
date: 2025-12-04
author: World Food Recipes
excerpt: Explore the ancient art of fermentation...
tags: fermentation, preservation, probiotics, kimchi, sauerkraut, traditional
image: https://images.unsplash.com/photo-...
---
```

**Required Fields:** title, date
**Optional Fields:** author, excerpt, tags, image
**Recipe-Specific Fields:** None
**Typical Content:** Techniques, tips, educational deep-dives
**Use Case:** Educational content, techniques, culinary principles

---

### Recipe Post Frontmatter (Example: `beef-stir-fry.md`)
```yaml
---
title: Quick Beef Stir-Fry
date: 2025-12-04
author: Chef Ming
excerpt: Make a flavorful beef stir-fry in minutes...
tags: beef, stir-fry, asian, quick-meals, dinner
image: https://images.unsplash.com/photo-...
prepTime: 15 minutes
cookTime: 10 minutes
servings: 4
ingredients:
  - 1 lb beef sirloin (sliced)
  - 2 cups mixed vegetables
  - 2 tbsp soy sauce
  - 1 tbsp oyster sauce
  - 2 cloves garlic (minced)
  - 1 tbsp cornstarch
  - 2 tbsp vegetable oil
  - Salt and pepper to taste
difficulty: Easy
---
```

**Required Fields:** title, date
**Optional Fields:** author, excerpt, tags, image
**Recipe-Specific Fields:**
- `prepTime`: Preparation time
- `cookTime`: Cooking time
- `servings`: Number of servings
- `ingredients`: Array of ingredient strings
- `difficulty`: Easy | Medium | Hard

**Typical Content:** Ingredients, instructions, cooking tips
**Use Case:** Specific recipes with step-by-step instructions

---

## 5. API Routes & Endpoints

### Posts API: `app/api/posts/route.ts`
**GET** `/api/posts`
- Fetches all blog posts from GitHub
- Returns: `BlogPost[]`
- Caching: 5-minute TTL

**POST** `/api/posts`
- Creates new blog post (admin only)
- Requires authentication via `isAdminAuthenticated()`
- Parameters: `title`, `author`, `excerpt`, `tags`, `image`, `content`

### Recipes API: `app/api/recipes/route.ts`
**GET** `/api/recipes`
- Fetches all recipes from GitHub
- Returns: `Recipe[]`
- Caching: 5-minute TTL

**POST** `/api/recipes`
- Creates new recipe (admin only)
- Requires authentication
- Parameters: `title`, `author`, `excerpt`, `tags`, `image`, `content`, `prepTime`, `cookTime`, `servings`, `ingredients`, `difficulty`

### Additional API Routes:
- `/api/posts/[slug]/` - Get individual post
- `/api/posts/delete/` - Delete post endpoint
- `/api/posts/update/` - Update post endpoint
- `/api/recipes/delete/` - Delete recipe endpoint
- `/api/recipes/update/` - Update recipe endpoint

---

## 6. Page Components for Full Display

### Blog Post Display: `components/pages/blog/BlogPost.tsx`
- Renders full blog post content
- Markdown processing (likely with markdown library)
- SEO metadata generation

### Recipe Display: `components/pages/recipes/RecipePost.tsx`
- Renders full recipe with structured ingredients/instructions
- Recipe-specific layout and styling
- Ingredient list formatting

### List Components:
- `BlogListServer.tsx` - Server-side blog list rendering
- `BlogListClient.tsx` - Client-side blog list with interactivity
- `BlogList.tsx` - Wrapper component
- `RecipesListClient.tsx` - Client-side recipes list
- `RecipesList.tsx` - Recipes list wrapper

### Related Content:
- `RecentPosts.tsx` - Shows recent blog posts
- `RelatedPosts.tsx` - Shows related blog posts
- `RelatedRecipes.tsx` - Shows related recipes

---

## 7. Type Interfaces

### `BlogPost` (lib/github.ts)
```typescript
interface BlogPost {
  id: string           // slug without .md extension
  title: string
  slug: string
  content: string      // markdown body
  excerpt?: string
  date: string         // ISO date string
  author?: string
  tags?: string[]
  image?: string       // image URL
}
```

### `Recipe extends BlogPost` (lib/github.ts)
```typescript
interface Recipe extends BlogPost {
  prepTime?: string    // e.g., "15 minutes"
  cookTime?: string    // e.g., "10 minutes"
  servings?: string    // e.g., "4"
  ingredients?: string[] // array of ingredient strings
  difficulty?: string  // "Easy" | "Medium" | "Hard"
}
```

---

## 8. Environment Variables Required

### For GitHub Content Loading:
```
GITHUB_OWNER=<github-username>
GITHUB_REPO=<repo-name>
GITHUB_TOKEN=<github-personal-access-token>
```

### For Site URLs:
```
NEXT_PUBLIC_SITE_URL=<your-domain>
```

---

## 9. Key Utilities Referenced

### `lib/utils.ts`
- `calculateReadingTime(content: string)` - Estimates reading time from word count

### `lib/cache.ts`
- `getCached<T>(key: string)` - Retrieves cached content
- `setCached(key: string, value: T, options)` - Sets cache with TTL
- **Caching Policy:**
  - Posts list: 5 minutes
  - Individual posts: 1 hour

### `lib/auth.ts`
- `isAdminAuthenticated()` - Validates admin access for POST/PUT/DELETE operations

---

## 10. Summary

| Feature | Blog | Recipe |
|---------|------|--------|
| **Storage** | posts/blog/*.md | posts/recipes/*.md |
| **Routes** | /blog/[slug] | /recipes/[slug] |
| **API** | /api/posts | /api/recipes |
| **Card Component** | BlogPostCard | RecipePostCard |
| **Display Component** | BlogPost | RecipePost |
| **Unique Fields** | None | prepTime, cookTime, servings, ingredients, difficulty |
| **Features** | Reading time, date | Cooking time, difficulty badge, favorites |
| **Content Focus** | Educational/Technical | Instructions/Practical |

Both content types use the same loading system via `fetchContentFromGitHub()` with different content directories and parsing paths. The main difference is recipe-specific metadata in the frontmatter and UI components that display recipe-focused information.
