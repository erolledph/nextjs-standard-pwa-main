interface UnsplashImage {
  id: string
  urls: {
    regular: string
    thumb: string
  }
  alt_description: string
  user: {
    name: string
  }
  links: {
    html: string
  }
}

// Cache for 24 hours
const imageCache = new Map<string, { url: string; expires: number }>()

/**
 * Get a reliable recipe image from Unsplash with fallbacks
 * Uses recipe title and cuisine for better matching
 */
export async function getRecipeImage(
  recipeTitle: string,
  cuisine?: string
): Promise<{ url: string; attribution?: string }> {
  try {
    const cacheKey = `${recipeTitle}-${cuisine || 'general'}`
    const cached = imageCache.get(cacheKey)

    // Return cached image if still valid
    if (cached && cached.expires > Date.now()) {
      return { url: cached.url }
    }

    // Build search query - prioritize specific recipe + cuisine
    const searchQueries = [
      `${recipeTitle} ${cuisine || 'food'}`,
      `${recipeTitle} recipe`,
      cuisine ? `${cuisine} food` : 'delicious food',
      'appetizing food',
    ]

    for (const query of searchQueries) {
      try {
        const image = await fetchFromUnsplash(query)
        if (image) {
          // Cache for 24 hours
          imageCache.set(cacheKey, {
            url: image.urls.regular,
            expires: Date.now() + 24 * 60 * 60 * 1000,
          })

          return {
            url: image.urls.regular,
            attribution: `Photo by ${image.user.name} on Unsplash`,
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch image for query: ${query}`, error)
        continue
      }
    }

    // If all Unsplash queries fail, use fallback
    return { url: getDefaultRecipeImage(cuisine) }
  } catch (error) {
    console.error('Error getting recipe image:', error)
    return { url: getDefaultRecipeImage(cuisine) }
  }
}

/**
 * Fetch image from Unsplash API with validation
 */
async function fetchFromUnsplash(query: string): Promise<UnsplashImage | null> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY

    if (!accessKey) {
      console.warn('UNSPLASH_ACCESS_KEY not configured, using fallback images')
      return null
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      console.warn(`Unsplash API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return null
    }

    const image = data.results[0]

    // Validate image URL is accessible
    if (await isImageAccessible(image.urls.regular)) {
      return image
    }

    return null
  } catch (error) {
    console.warn('Unsplash fetch error:', error)
    return null
  }
}

/**
 * Validate that an image URL is accessible
 */
async function isImageAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', next: { revalidate: 86400 } })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get default fallback images based on cuisine
 */
function getDefaultRecipeImage(cuisine?: string): string {
  const defaultImages: Record<string, string> = {
    african: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    asian: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    asian_fusion: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    caribbean: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    chinese: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    european: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    indian: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    italian: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    japanese: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    mediterranean: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    mexican: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    middle_eastern: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    thai: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    vietnamese: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
  }

  const key = cuisine?.toLowerCase().replace(/\s+/g, '_') || 'default'
  return defaultImages[key] || defaultImages.default
}

/**
 * Get image for a specific food item (ingredient-based)
 */
export async function getIngredientImage(
  ingredient: string
): Promise<{ url: string; attribution?: string }> {
  try {
    const cacheKey = `ingredient-${ingredient}`
    const cached = imageCache.get(cacheKey)

    if (cached && cached.expires > Date.now()) {
      return { url: cached.url }
    }

    const image = await fetchFromUnsplash(ingredient)
    if (image) {
      imageCache.set(cacheKey, {
        url: image.urls.thumb,
        expires: Date.now() + 24 * 60 * 60 * 1000,
      })

      return {
        url: image.urls.thumb,
        attribution: `Photo by ${image.user.name}`,
      }
    }

    return {
      url: `https://via.placeholder.co/200x200?text=${encodeURIComponent(ingredient)}`,
    }
  } catch (error) {
    console.error('Error getting ingredient image:', error)
    return {
      url: `https://via.placeholder.co/200x200?text=${encodeURIComponent(ingredient)}`,
    }
  }
}
