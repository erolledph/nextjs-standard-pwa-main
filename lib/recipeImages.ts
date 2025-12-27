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
      console.log(`📸 Using cached image for: ${recipeTitle}`)
      return { url: cached.url }
    }

    // Build search query - prioritize specific recipe + cuisine
    const searchQueries = [
      `${recipeTitle} ${cuisine || 'food'}`,
      `${recipeTitle} recipe`,
      cuisine ? `${cuisine} food` : 'delicious food',
      'appetizing food',
    ]

    console.log(`🔍 Fetching image for recipe: ${recipeTitle} (${cuisine})`)
    
    for (const query of searchQueries) {
      try {
        const image = await fetchFromUnsplash(query)
        if (image) {
          // Cache for 24 hours
          imageCache.set(cacheKey, {
            url: image.urls.regular,
            expires: Date.now() + 24 * 60 * 60 * 1000,
          })

          console.log(`✅ Found image from Unsplash for query: ${query}`)
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
    console.log(`⚠️ No image found on Unsplash, using fallback for cuisine: ${cuisine}`)
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
      console.warn('⚠️ UNSPLASH_ACCESS_KEY not configured, using fallback images')
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
    african: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&h=500&fit=crop&q=80', // Tagine
    asian: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop&q=80', // Buddha Bowl
    asian_fusion: 'https://images.unsplash.com/photo-1631100732613-6b65da9a343d?w=800&h=500&fit=crop&q=80', // Bao Buns
    caribbean: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=800&h=500&fit=crop&q=80', // Jerk Chicken
    chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=500&fit=crop&q=80', // Fried Rice
    european: 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&h=500&fit=crop&q=80', // Plated Meat/Veg
    french: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=500&fit=crop&q=80', // Croissants/Pastries
    indian: 'https://images.unsplash.com/photo-1738291422837-85761f82a10e?w=800&h=500&fit=crop&q=80', // Chicken Tikka
    italian: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&h=500&fit=crop&q=80', // Pesto Pasta
    japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=500&fit=crop&q=80', // Sushi Platter
    korean: 'https://images.unsplash.com/photo-1661366394743-fe30fe478ef7?w=800&h=500&fit=crop&q=80', // Bibimbap
    mediterranean: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=500&fit=crop&q=80', // Fresh Salad
    mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=500&fit=crop&q=80', // Tacos
    middle_eastern: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=500&fit=crop&q=80', // Kebabs
    thai: 'https://images.unsplash.com/photo-1675150277436-9c7348972c11?w=800&h=500&fit=crop&q=80', // Pad Thai
    vietnamese: 'https://images.unsplash.com/photo-1509072619873-adb3dc289b50?w=800&h=500&fit=crop&q=80', // Spring Rolls
    default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop&q=80', // Generic Food Table
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
