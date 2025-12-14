import { NextRequest, NextResponse } from "next/server";
import { getAIRecipes } from "@/lib/firebase-admin";

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Verify admin session via cookie
    const sessionCookie = request.cookies.get('admin-session')?.value
    if (!sessionCookie || sessionCookie !== 'true') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const recipes = await getAIRecipes(false); // Fetch all recipes, not just published
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Error fetching AI recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI recipes" },
      { status: 500 }
    );
  }
}
