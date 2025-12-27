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
    african: 'https://images.unsplash.com/photo-1504674900769-7c168f8bd17e?w=800&h=500&fit=crop&q=80', // African food
    asian: 'https://images.unsplash.com/photo-1537047902294-6d01f4bbe3e0?w=800&h=500&fit=crop&q=80', // Asian noodles
    asian_fusion: 'https://images.unsplash.com/photo-1543521521-b2b0c2e1f78d?w=800&h=500&fit=crop&q=80', // Fusion cuisine
    caribbean: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop&q=80', // Caribbean food
    chinese: 'https://images.unsplash.com/photo-1585238341710-4dd0287b2226?w=800&h=500&fit=crop&q=80', // Chinese stir fry
    european: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80', // European cuisine
    french: 'https://images.unsplash.com/photo-1484723991212-4601c1227ae0?w=800&h=500&fit=crop&q=80', // French cuisine
    indian: 'https://images.unsplash.com/photo-1596040541827-e5267edb7e9e?w=800&h=500&fit=crop&q=80', // Indian curry
    italian: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=500&fit=crop&q=80', // Italian pasta
    japanese: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=500&fit=crop&q=80', // Japanese sushi
    korean: 'https://images.unsplash.com/photo-1599599810694-b3ac228c94d5?w=800&h=500&fit=crop&q=80', // Korean food
    mediterranean: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80', // Mediterranean
    mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=500&fit=crop&q=80', // Mexican food
    middle_eastern: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop&q=80', // Middle Eastern
    thai: 'https://images.unsplash.com/photo-1589273346635-87d9d96b0908?w=800&h=500&fit=crop&q=80', // Thai food
    vietnamese: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop&q=80', // Vietnamese pho
    default: 'https://images.unsplash.com/photo-1495654633220-2f6e66e73833?w=800&h=500&fit=crop&q=80', // Generic food
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
