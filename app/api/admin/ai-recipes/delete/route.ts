import { NextRequest, NextResponse } from "next/server";
import { deleteAIRecipe } from "@/lib/firebase-admin";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { error: "Invalid input", details: "Missing recipeId" },
        { status: 400 }
      );
    }

    const success = await deleteAIRecipe(recipeId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to delete recipe from Firebase" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/admin/ai-recipes/delete:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
