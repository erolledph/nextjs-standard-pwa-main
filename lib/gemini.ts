/**
 * Gemini AI Client for Recipe Generation
 * Uses Gemini 2.5 Flash-Lite for cost-efficient AI responses
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import { RecipeResponse, AIChefInput } from "@/types/ai-chef"

const apiKey = process.env.GEMINI_API_KEY

let client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey)
  }
  return client
}

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
 * Generate a recipe using Gemini 2.5 Flash-Lite
 */
export async function generateRecipeWithAI(input: AIChefInput): Promise<RecipeResponse> {
  try {
    console.log("🟡 [GEMINI-1] Starting recipe generation for:", input)
    const userPrompt = buildPrompt(input)
    console.log("🟡 [GEMINI-2] User prompt built:", userPrompt.substring(0, 100) + "...")

    console.log("🟡 [GEMINI-3] Getting Gemini model instance...")
    const model = getClient().getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    })
    console.log("🟢 [GEMINI-4] Model instance created")

    // Use non-streaming for deterministic response
    console.log("🟡 [GEMINI-5] Calling generateContent with model 'gemini-2.5-flash-lite'...")
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0, // Deterministic responses for consistency
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json", // Force JSON output
      },
    })

    console.log("🟢 [GEMINI-6] Response received from Gemini API")
    const text = response.response.text()
    console.log("🟡 [GEMINI-7] Response text length:", text.length)
    console.log("🟡 [GEMINI-8] Response text (first 200 chars):", text.substring(0, 200))

    // Parse and validate JSON response
    let parsedResponse: any
    try {
      // Remove markdown code blocks if present (shouldn't happen but safety first)
      const cleanText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()
      console.log("🟡 [GEMINI-9] Cleaned text (first 200 chars):", cleanText.substring(0, 200))
      console.log("🟡 [GEMINI-10] Attempting JSON.parse...")
      parsedResponse = JSON.parse(cleanText)
      console.log("🟢 [GEMINI-11] JSON parsed successfully!")
      console.log("🟢 [GEMINI-12] Parsed response keys:", Object.keys(parsedResponse))
    } catch (parseError) {
      console.error("🔴 [GEMINI-13] Failed to parse AI response as JSON:", text)
      console.error("🔴 [GEMINI-14] Parse error details:", parseError)
      throw new Error("AI response was not valid JSON")
    }

    console.log("🟢 [GEMINI-15] Returning parsed response")
    return parsedResponse as RecipeResponse
  } catch (error) {
    console.error("🔴 [GEMINI-ERROR] Exception in generateRecipeWithAI:", error)
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        console.error("🔴 [GEMINI-ERROR-1] API key issue")
        throw new Error("Gemini API key is invalid")
      }
      if (error.message.includes("quota")) {
        console.error("🔴 [GEMINI-ERROR-2] Quota issue")
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
 * Check if Gemini API is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
