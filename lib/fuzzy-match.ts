/**
 * Fuzzy matching utility for finding similar queries
 * Used to match user inputs with cached recipes
 */

/**
 * Levenshtein distance - measures edit distance between two strings
 * Used for fuzzy matching of text queries
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score between two strings (0-1)
 * 1.0 = identical, 0.0 = completely different
 */
export function stringSimilarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 1.0

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  return 1.0 - distance / maxLength
}

/**
 * Check if an item is in an array using fuzzy matching
 */
export function fuzzyIncludes(
  array: string[],
  item: string,
  threshold: number = 0.8
): boolean {
  return array.some((arr) => stringSimilarity(arr, item) > threshold)
}

/**
 * Calculate similarity between two ingredient lists
 */
export function ingredientsSimilarity(
  ingredients1: string[],
  ingredients2: string[]
): number {
  if (ingredients1.length === 0 || ingredients2.length === 0) return 0

  let matches = 0
  for (const ingredient of ingredients1) {
    if (fuzzyIncludes(ingredients2, ingredient, 0.75)) {
      matches++
    }
  }

  // Return average similarity
  return matches / Math.max(ingredients1.length, ingredients2.length)
}

/**
 * Calculate similarity between two taste profiles
 */
export function tasteSimilarity(tastes1: string[], tastes2: string[]): number {
  if (tastes1.length === 0 || tastes2.length === 0) return 0

  let matches = 0
  for (const taste of tastes1) {
    if (fuzzyIncludes(tastes2, taste, 0.85)) {
      matches++
    }
  }

  return matches / Math.max(tastes1.length, tastes2.length)
}

/**
 * Calculate overall similarity score between two recipe queries
 * Returns a score from 0 to 1
 */
export function calculateQuerySimilarity(
  query1: {
    description: string
    country: string
    protein: string
    taste: string[]
    ingredients: string[]
  },
  query2: {
    description: string
    country: string
    protein: string
    taste: string[]
    ingredients: string[]
  }
): number {
  // Exact matches get highest weight
  const countryMatch = query1.country.toLowerCase() === query2.country.toLowerCase() ? 0.25 : 0
  const proteinMatch =
    query1.protein.toLowerCase() === query2.protein.toLowerCase() ? 0.25 : 0

  // Fuzzy matches get lower weight
  const descriptionSimilarity = stringSimilarity(query1.description, query2.description) * 0.2
  const ingredientsSimilarity_ = ingredientsSimilarity(query1.ingredients, query2.ingredients) * 0.15
  const tasteSimilarity_ = tasteSimilarity(query1.taste, query2.taste) * 0.15

  const totalScore =
    countryMatch +
    proteinMatch +
    descriptionSimilarity +
    ingredientsSimilarity_ +
    tasteSimilarity_

  return Math.min(totalScore, 1.0) // Cap at 1.0
}

/**
 * Generate a consistent hash for a recipe query
 * Used as unique identifier for caching
 */
export function generateQueryHash(input: {
  description: string
  country: string
  protein: string
  taste: string[]
  ingredients: string[]
}): string {
  const normalized = {
    description: input.description.toLowerCase().trim(),
    country: input.country.toLowerCase().trim(),
    protein: input.protein.toLowerCase().trim(),
    taste: input.taste
      .map((t) => t.toLowerCase().trim())
      .sort()
      .join(","),
    ingredients: input.ingredients
      .map((i) => i.toLowerCase().trim())
      .sort()
      .join(","),
  }

  const str = JSON.stringify(normalized)

  // Simple hash function
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16).padStart(8, "0")
}

/**
 * Find best matching queries from a list
 */
export function findBestMatches(
  query: {
    description: string
    country: string
    protein: string
    taste: string[]
    ingredients: string[]
  },
  candidates: Array<{
    queryHash: string
    input: {
      description: string
      country: string
      protein: string
      taste: string[]
      ingredients: string[]
    }
    [key: string]: any
  }>,
  minThreshold: number = 0.7
) {
  return candidates
    .map((candidate) => ({
      ...candidate,
      similarity: calculateQuerySimilarity(query, candidate.input),
    }))
    .filter((result) => result.similarity >= minThreshold)
    .sort((a, b) => b.similarity - a.similarity)
}
