import { Metadata } from "next"
import { getRecipeImage } from "@/lib/recipeImages"

export const runtime = 'edge'

async function fetchRecipe(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/ai-chef/get-recipe?id=${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
  const pageUrl = `${baseUrl}/ai-chef/${slug}`

  if (!recipe) {
    return {
      title: 'Recipe Not Found | World Food Recipes AI Chef',
      description: 'The recipe you are looking for could not be found.',
    }
  }

  const description = recipe.description || `Try this AI-generated ${recipe.cuisine || 'delicious'} recipe. Prep: ${recipe.prepTime}, Cook: ${recipe.cookTime}`

  // Fetch recipe image for OG and Twitter cards
  const recipeImage = await getRecipeImage(recipe.title, recipe.cuisine || 'food')
  const imageUrl = recipeImage.url || '/og-image.jpg'

  return {
    title: `${recipe.title} | AI Chef - World Food Recipes`,
    description: description,
    keywords: [recipe.title, 'AI recipe', 'cooking', recipe.cuisine].filter(Boolean),
    authors: [{ name: 'AI Chef' }],
    creator: 'World Food Recipes AI Chef',
    publisher: 'World Food Recipes',
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: recipe.title,
      description: description,
      url: pageUrl,
      type: 'website',
      siteName: 'World Food Recipes - AI Chef',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: recipe.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: description,
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
