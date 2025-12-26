/**
 * Groq AI Client for Recipe Generation
 * Uses Groq's Llama 3.1 8B Instant for ultra-fast, free recipe generation
 * Groq provides 14,400 requests/day on free tier (720x more than Gemini)
 */

import { RecipeResponse, AIChefInput } from "@/types/ai-chef"

const apiKey = process.env.GROQ_API_KEY

/**
 * System prompt to constrain AI responses
 * Ensures the AI only uses provided ingredients and follows all constraints
 */
const SYSTEM_PROMPT = `You are an expert chef AI assistant specialized in recipe creation. Your role is to generate accurate, detailed recipes based on strict user constraints.

CRITICAL CONSTRAINTS:
1. ONLY use ingredients provided by the user - do not suggest additional ingredients
2. ONLY create recipes matching the specified cuisine/country
3. ONLY use the specified protein type - do not substitute
4. Match the taste profile preferences exactly
5. Create recipes the user can actually make with ONLY the given ingredients
6. If the ingredients cannot create a good recipe with those constraints, say so honestly

RESPONSE FORMAT:
Return ONLY valid, properly formatted JSON. No markdown, no code blocks, no explanation text, just JSON.

The JSON must follow this exact structure:
{
  "title": "Recipe name",
  "servings": "4-6" or "4",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "2",
      "unit": "cups"
    }
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "tips": [
    "Cooking tip 1",
    "Cooking tip 2"
  ],
  "nutritionInfo": {
    "calories": 250,
    "protein": "25g",
    "carbs": "30g",
    "fat": "8g"
  }
}`

/**
 * Generate a recipe using Groq's Llama 3.1 8B Instant
 */
export async function generateRecipeWithAI(input: AIChefInput): Promise<RecipeResponse> {
  try {
    console.log("🟡 [GROQ-1] Starting recipe generation for:", input)
    const userPrompt = buildPrompt(input)
    console.log("🟡 [GROQ-2] User prompt built:", userPrompt.substring(0, 100) + "...")

    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set")
    }

    console.log("🟡 [GROQ-3] Calling Groq API with model 'llama-3.1-8b-instant'...")
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON output
        top_p: 0.95,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("🔴 [GROQ-4] API error response:", errorData)
      
      if (response.status === 429) {
        throw new Error("API quota exceeded - try again later")
      }
      if (response.status === 401) {
        throw new Error("Groq API key is invalid")
      }
      
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    console.log("🟢 [GROQ-5] Response received from Groq API")
    
    // Extract rate limit headers from response
    const rateHeaders: Record<string, string | number> = {
      "x-ratelimit-limit-requests": response.headers.get("x-ratelimit-limit-requests") || "14400",
      "x-ratelimit-limit-tokens": response.headers.get("x-ratelimit-limit-tokens") || "6000",
      "x-ratelimit-remaining-requests": response.headers.get("x-ratelimit-remaining-requests") || "0",
      "x-ratelimit-remaining-tokens": response.headers.get("x-ratelimit-remaining-tokens") || "0",
      "x-ratelimit-reset-requests": response.headers.get("x-ratelimit-reset-requests") || "24h",
      "x-ratelimit-reset-tokens": response.headers.get("x-ratelimit-reset-tokens") || "24h",
    }
    
    console.log("🟡 [GROQ-5b] Rate limit headers:", rateHeaders)
    
    // Track quota usage with rate headers
    try {
      await fetch("/api/admin/groq-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "increment",
          rateHeaders,
        }),
      })
    } catch (quotaErr) {
      console.warn("⚠️ [GROQ] Could not track quota:", quotaErr)
    }
    
    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("🔴 [GROQ-6] Unexpected response structure:", data)
      throw new Error("Unexpected Groq API response format")
    }

    const text = data.choices[0].message.content
    console.log("🟡 [GROQ-7] Response text length:", text.length)
    console.log("🟡 [GROQ-8] Response text (first 200 chars):", text.substring(0, 200))

    // Parse and validate JSON response
    let parsedResponse: any
    try {
      // Remove markdown code blocks if present
      const cleanText = text
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "")
        .trim()
      
      console.log("🟡 [GROQ-9] Cleaned text (first 200 chars):", cleanText.substring(0, 200))
      console.log("🟡 [GROQ-10] Attempting JSON.parse...")
      parsedResponse = JSON.parse(cleanText)
      console.log("🟢 [GROQ-11] JSON parsed successfully!")
      console.log("🟢 [GROQ-12] Parsed response keys:", Object.keys(parsedResponse))
    } catch (parseError) {
      console.error("🔴 [GROQ-13] Failed to parse AI response as JSON:", text)
      console.error("🔴 [GROQ-14] Parse error details:", parseError)
      throw new Error("AI response was not valid JSON")
    }

    console.log("🟢 [GROQ-15] Returning parsed response")
    return parsedResponse as RecipeResponse
  } catch (error) {
    console.error("🔴 [GROQ-ERROR] Exception in generateRecipeWithAI:", error)
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        console.error("🔴 [GROQ-ERROR-1] API key issue")
        throw new Error("Groq API key is invalid")
      }
      if (error.message.includes("quota")) {
        console.error("🔴 [GROQ-ERROR-2] Quota issue")
        throw new Error("API quota exceeded - try again later")
      }
      throw error
    }
    throw new Error("Failed to generate recipe with AI")
  }
}

/**
 * Build user prompt from form inputs
 * Ensures all information is formatted clearly for the AI
 */
function buildPrompt(input: AIChefInput): string {
  return `Create a recipe with these exact constraints:

Country/Cuisine: ${input.country}
Protein Type: ${input.protein}
Available Ingredients: ${input.ingredients.join(", ")}
Taste Profile: ${input.taste.join(", ")}
Additional Context: ${input.description || "No additional context"}

IMPORTANT REMINDERS:
- Use ONLY the ingredients listed above
- Do NOT suggest substitutes or additional ingredients
- The user cannot use anything else
- Create a delicious, authentic recipe within these constraints
- If impossible, explain why instead of making up ingredients`
}

/**
 * Check if Groq API is properly configured
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY
}
