import { RecipesListClient } from "./RecipesListClient"

interface Recipe {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  prepTime?: string
  cookTime?: string
  servings?: string
  difficulty?: string
}

interface RecipesListProps {
  recipes: Recipe[]
}

export function RecipesList({ recipes }: RecipesListProps) {
  return <RecipesListClient recipes={recipes} />
}
