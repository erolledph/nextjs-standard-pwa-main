import { NextRequest, NextResponse } from "next/server";
import { getAIRecipes } from "@/lib/firebase-admin";

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no authentication required
    // Returns published AI recipes for display on the site
    const recipes = await getAIRecipes(true); // Fetch only published recipes
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Error fetching AI recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI recipes", recipes: [] },
      { status: 500 }
    );
  }
}
