import { NextRequest, NextResponse } from "next/server";
import { saveAIRecipeToFirebase } from "@/lib/firebase-admin";

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipe, userInput } = body;

    if (!recipe || !userInput) {
      return NextResponse.json(
        { error: "Invalid input", details: "Missing recipe or userInput" },
        { status: 400 }
      );
    }

    const recipeId = await saveAIRecipeToFirebase(recipe, userInput);

    if (recipeId) {
      return NextResponse.json({ success: true, recipeId });
    } else {
      return NextResponse.json(
        { error: "Failed to save recipe to Firebase" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/ai-chef/save:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

