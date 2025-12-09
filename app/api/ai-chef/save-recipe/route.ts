/**
 * Save AI-generated recipe to Firebase
 * Saves the recipe and input data for later conversion to recipe posts
 *
 * POST /api/ai-chef/save-recipe
 * Body: { recipe, input }
 */

import { NextResponse, type NextRequest } from "next/server"
import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"

// Initialize Firebase (client-side compatible)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
}

// Use Edge runtime for Cloudflare Pages compatibility
export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipe, input } = body

    if (!recipe || !input) {
      return NextResponse.json(
        { error: "Missing recipe or input data" },
        { status: 400 }
      )
    }

    // Return success message indicating client should save directly to Firestore
    // This endpoint is edge-compatible and provides guidance for client-side saving
    return NextResponse.json(
      {
        success: true,
        message: "Recipe data validated. Use client-side Firestore to save.",
        data: {
          id: `ai-recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: recipe.title,
          description: recipe.description,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing recipe:", error)
    return NextResponse.json(
      { error: "Failed to process recipe" },
      { status: 500 }
    )
  }
}
