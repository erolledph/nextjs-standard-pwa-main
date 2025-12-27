/**
 * Zod schemas for AI Chef input and output validation
 */

import { z } from "zod"

/**
 * Validate AI Chef form input from user
 */
export const AIChefInputSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters")
    .transform((val) => val.trim()),

  country: z
    .string()
    .min(2, "Please select a valid cuisine/country")
    .max(50, "Country name too long"),

  taste: z
    .array(z.string())
    .min(1, "Select at least one taste profile")
    .max(3, "Select at most 3 taste profiles"),

  protein: z
    .string()
    .min(2, "Please select a valid protein")
    .max(30, "Protein name too long"),

  ingredients: z
    .array(z.string())
    .min(3, "Select at least 3 ingredients")
    .max(20, "Select at most 20 ingredients"),
})

export type AIChefInputType = z.infer<typeof AIChefInputSchema>

/**
 * Validate AI-generated recipe response
 */
export const IngredientSchema = z.object({
  item: z.string().min(1),
  amount: z.string().min(1),
  unit: z.string().min(1),
})

export const NutritionInfoSchema = z.object({
  calories: z.number().optional(),
  protein: z.string().optional(),
  carbs: z.string().optional(),
  fat: z.string().optional(),
})

export const RecipeResponseSchema = z.object({
  title: z
    .string()
    .min(3, "Recipe title too short")
    .max(100, "Recipe title too long"),

  servings: z
    .string()
    .regex(/^\d+(-\d+)?$/, "Invalid servings format")
    .max(10),

  prepTime: z
    .string()
    .regex(/^\d+ minutes$/, "Invalid prep time format (e.g., '15 minutes')")
    .max(20),

  cookTime: z
    .string()
    .regex(/^\d+ minutes$/, "Invalid cook time format (e.g., '30 minutes')")
    .max(20),

  ingredients: z
    .array(IngredientSchema)
    .min(1, "At least one ingredient required"),

  instructions: z
    .array(z.string().min(5, "Instruction too short").max(500))
    .min(1, "At least one instruction required")
    .max(50, "Too many instructions"),

  tips: z
    .array(z.string().min(5).max(200))
    .optional()
    .default([]),

  nutritionInfo: NutritionInfoSchema.optional(),
  
  cuisine: z
    .string()
    .max(50, "Cuisine name too long")
    .optional(),
    
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .optional(),
})

export type RecipeResponseType = z.infer<typeof RecipeResponseSchema>

/**
 * Validation for request body
 */
export const AIChefRequestSchema = z.object({
  body: AIChefInputSchema,
  csrfToken: z.string(),
})
