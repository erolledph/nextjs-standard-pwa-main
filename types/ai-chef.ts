/**
 * TypeScript types for AI Chef feature
 */

/**
 * Input form data from user
 */
export interface AIChefInput {
  description: string
  country: string
  taste: string[]
  protein: string
  ingredients: string[]
}

/**
 * AI-generated recipe response (JSON format from Gemini)
 */
export interface RecipeResponse {
  title: string
  servings: string // "4" or "4-6"
  prepTime: string // "15 minutes"
  cookTime: string // "30 minutes"
  ingredients: Ingredient[]
  instructions: string[]
  tips?: string[]
  nutritionInfo?: NutritionInfo
}

/**
 * Individual ingredient with amount and unit
 */
export interface Ingredient {
  item: string
  amount: string // "2"
  unit: string // "cups", "tbsp", "g", etc
}

/**
 * Nutrition information per serving
 */
export interface NutritionInfo {
  calories?: number
  protein?: string // "25g"
  carbs?: string // "30g"
  fat?: string // "8g"
}

/**
 * Predefined options for form dropdowns
 */
export const CUISINES = [
  "American",
  "Asian",
  "Chinese",
  "Filipino",
  "French",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mediterranean",
  "Mexican",
  "Thai",
  "Vietnamese",
  "Middle Eastern",
  "African",
  "Caribbean",
]

export const TASTE_PROFILES = [
  "Spicy",
  "Sweet",
  "Savory",
  "Umami",
  "Sour",
  "Bitter",
  "Mild",
  "Rich",
  "Light",
  "Tangy",
  "Smoky",
  "Fresh",
]

export const PROTEINS = [
  "Chicken",
  "Beef",
  "Pork",
  "Fish",
  "Shrimp",
  "Tofu",
  "Tempeh",
  "Beans",
  "Lentils",
  "Eggs",
  "Seitan",
  "Lamb",
]

export const INGREDIENTS_OPTIONS = [
  "Garlic",
  "Onion",
  "Tomato",
  "Ginger",
  "Chili",
  "Cilantro",
  "Basil",
  "Oregano",
  "Thyme",
  "Bay Leaf",
  "Salt",
  "Black Pepper",
  "Cumin",
  "Turmeric",
  "Paprika",
  "Soy Sauce",
  "Fish Sauce",
  "Vinegar",
  "Lime",
  "Lemon",
  "Coconut Milk",
  "Olive Oil",
  "Vegetable Oil",
  "Butter",
  "Cream",
  "Milk",
  "Yogurt",
  "Flour",
  "Cornstarch",
  "Rice",
  "Pasta",
  "Potatoes",
  "Carrots",
  "Bell Peppers",
  "Broccoli",
  "Spinach",
  "Mushrooms",
  "Green Beans",
  "Peas",
  "Cabbage",
  "Lettuce",
]
