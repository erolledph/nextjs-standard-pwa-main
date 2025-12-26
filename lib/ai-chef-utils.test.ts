
import { shouldGenerateFreshRecipe, getBestRecipeFromSearch, type SearchResult } from './ai-chef-utils';

// Simple test suite
function runTests() {
    console.log("Running ai-chef-utils tests...");
    let passed = 0;
    let failed = 0;

    function assert(condition: boolean, message: string) {
        if (!condition) {
            console.error(`❌ FAILED: ${message}`);
            failed++;
        } else {
            console.log(`✅ PASSED: ${message}`);
            passed++;
        }
    }

    // Test 1: shouldGenerateFreshRecipe - Exact Match
    const exactMatch: SearchResult = {
        source: "cache_exact",
        recipe: { title: "Exact" }
    };
    assert(shouldGenerateFreshRecipe(exactMatch) === false, "Exact match should not generate fresh");

    // Test 2: shouldGenerateFreshRecipe - Found Similar (shouldGenerateNew: false)
    const similarFound: SearchResult = {
        shouldGenerateNew: false,
        cachedResults: [{ title: "Similar" }],
        recipePosts: []
    };
    assert(shouldGenerateFreshRecipe(similarFound) === false, "Similar found should not generate fresh");

    // Test 3: shouldGenerateFreshRecipe - No Match (shouldGenerateNew: true)
    const noMatch: SearchResult = {
        shouldGenerateNew: true,
        cachedResults: [],
        recipePosts: []
    };
    assert(shouldGenerateFreshRecipe(noMatch) === true, "No match should generate fresh");

    // Test 4: getBestRecipeFromSearch - Exact Match
    const bestFromExact = getBestRecipeFromSearch(exactMatch);
    assert(bestFromExact !== null && bestFromExact.title === "Exact", "Should return exact match recipe");

    // Test 5: getBestRecipeFromSearch - Cached Result
    const bestFromCached = getBestRecipeFromSearch(similarFound);
    assert(bestFromCached !== null && bestFromCached.title === "Similar", "Should return first cached result");

    // Test 6: getBestRecipeFromSearch - No Results
    const bestFromNothing = getBestRecipeFromSearch(noMatch);
    assert(bestFromNothing === null, "Should return null when no results");

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
