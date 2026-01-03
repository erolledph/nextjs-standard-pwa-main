import { Metadata } from "next"
import { getRecipeImage } from "@/lib/recipeImages"

async function fetchRecipe(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/ai-chef/get-recipe?id=${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.recipe
  } catch (err) {
    console.error("Error fetching recipe:", err)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const recipe = await fetchRecipe(slug)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const pageUrl = `${baseUrl}/ai-chef/${slug}`

  if (!recipe) {
    return {
      title: 'Recipe Not Found | World Food Recipes AI Chef',
      description: 'The recipe you are looking for could not be found.',
    }
  }

  const description = recipe.description || `Easy AI-generated ${recipe.cuisine || 'delicious'} recipe. Prep time: ${recipe.prepTime}, Cooking time: ${recipe.cookTime}. Learn how to make this tasty dish at home.`

  // Create more detailed OG title (50-60 chars optimal)
  const ogTitle = `${recipe.title} Recipe - Easy ${recipe.cuisine || 'Homemade'} Cooking`
  
  // Create more detailed description (110-160 chars optimal)
  const ogDescription = `${recipe.title} - AI-generated ${recipe.cuisine || 'delicious'} recipe with easy instructions. Prep: ${recipe.prepTime}, Cook: ${recipe.cookTime}. Perfect for dinner!`

  // Use cached recipe image or fetch one
  let imageUrl = `${baseUrl}/og-image.svg` // Local fallback
  
  if (recipe.imageUrl) {
    // Recipe already has a cached image
    imageUrl = recipe.imageUrl
  } else {
    // Fetch image for recipes without cached image
    try {
      const recipeImage = await getRecipeImage(recipe.title, recipe.cuisine || 'food')
      if (recipeImage?.url) {
        imageUrl = recipeImage.url
      }
    } catch (error) {
      console.warn('Failed to fetch recipe image, using default:', error)
    }
  }

  // Ensure imageUrl is absolute (starts with http or /)
  if (!imageUrl.startsWith('http')) {
    imageUrl = `${baseUrl}${imageUrl}`
  }

  return {
    title: `${recipe.title} Recipe | Easy AI Chef - World Food Recipes`,
    description: description,
    keywords: [recipe.title, 'AI recipe', 'cooking', 'easy recipe', recipe.cuisine, 'how to make'].filter(Boolean),
    authors: [{ name: 'AI Chef' }],
    creator: 'World Food Recipes AI Chef',
    publisher: 'World Food Recipes',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: pageUrl,
      type: 'website',
      siteName: 'World Food Recipes - AI Chef',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: recipe.title,
          type: 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [imageUrl],
      creator: '@worldfoodrecipes',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
