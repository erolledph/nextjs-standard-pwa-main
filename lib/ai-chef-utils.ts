
import { type AIChefInputType } from "@/lib/ai-chef-schema"

export interface SearchResult {
  recipePosts?: any[]
  cachedResults?: any[]
  shouldGenerateNew?: boolean
  queryHash?: string
  freshResponse?: any
  source?: string
  recipe?: any
}

/**
 * Determines if we should generate a fresh AI recipe based on search results.
 *
 * Rules:
 * 1. If exact cache match, do not generate.
 * 2. If shouldGenerateNew is false (from API), do not generate.
 * 3. Otherwise, generate.
 */
export function shouldGenerateFreshRecipe(searchData: SearchResult): boolean {
  if (searchData.source === 'cache_exact') return false;
  if (searchData.shouldGenerateNew === false) return false;
  return true;
}

/**
 * Gets the best recipe from search results if we decide not to generate a new one.
 * This ensures the UI has something to show in the "freshResponse" slot or suggestions.
 */
export function getBestRecipeFromSearch(searchData: SearchResult): any {
  if (searchData.source === 'cache_exact' && searchData.recipe) {
    return searchData.recipe;
  }

  // If we have cached results, use the first one (most similar)
  if (searchData.cachedResults && searchData.cachedResults.length > 0) {
    return searchData.cachedResults[0];
  }

  return null;
}
