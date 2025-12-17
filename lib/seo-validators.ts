/**
 * SEO Structured Data Validators
 * Validate JSON-LD schemas before rendering
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate Recipe schema
 */
export function validateRecipeSchema(schema: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!schema.name) errors.push("Recipe schema missing required 'name' field")
  if (!schema.description) errors.push("Recipe schema missing required 'description' field")
  if (!schema.image) errors.push("Recipe schema missing required 'image' field")
  if (!schema.author) errors.push("Recipe schema missing required 'author' field")

  // Recommended fields
  if (!schema.prepTime) warnings.push("Recipe schema should include 'prepTime'")
  if (!schema.cookTime) warnings.push("Recipe schema should include 'cookTime'")
  if (!schema.recipeYield) warnings.push("Recipe schema should include 'recipeYield'")
  if (!schema.recipeIngredient) warnings.push("Recipe schema should include 'recipeIngredient'")
  if (!schema.recipeInstructions) warnings.push("Recipe schema should include 'recipeInstructions'")

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate Article/BlogPosting schema
 */
export function validateArticleSchema(schema: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!schema.headline) errors.push("Article schema missing required 'headline' field")
  if (!schema.description) errors.push("Article schema missing required 'description' field")
  if (!schema.image) errors.push("Article schema missing required 'image' field")
  if (!schema.author) errors.push("Article schema missing required 'author' field")
  if (!schema.datePublished) errors.push("Article schema missing required 'datePublished' field")

  // Recommended fields
  if (!schema.articleBody) warnings.push("Article schema should include 'articleBody'")
  if (!schema.wordCount) warnings.push("Article schema should include 'wordCount'")
  if (!schema.keywords) warnings.push("Article schema should include 'keywords'")

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate FAQ schema
 */
export function validateFAQSchema(schema: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
    errors.push("FAQ schema missing required 'mainEntity' array")
  } else if (schema.mainEntity.length < 1) {
    errors.push("FAQ schema 'mainEntity' should have at least 1 question")
  }

  if (schema.mainEntity && schema.mainEntity.length > 0) {
    schema.mainEntity.forEach((item: any, index: number) => {
      if (!item.name) errors.push(`FAQ item ${index} missing 'name' (question)`)
      if (!item.acceptedAnswer?.text) errors.push(`FAQ item ${index} missing 'acceptedAnswer.text' (answer)`)
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Log validation results in development
 */
export function logValidationResults(name: string, result: ValidationResult): void {
  if (process.env.NODE_ENV === 'development') {
    if (!result.isValid) {
      console.error(`❌ ${name} Schema Validation Failed:`, result.errors)
    }
    if (result.warnings.length > 0) {
      console.warn(`⚠️ ${name} Schema Warnings:`, result.warnings)
    }
    if (result.isValid && result.warnings.length === 0) {
      console.log(`✅ ${name} Schema Valid`)
    }
  }
}
