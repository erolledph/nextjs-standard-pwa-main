/**
 * Get all AI-generated recipes from Firebase
 * Fetches unpublished AI recipes for the admin dashboard
 * 
 * GET /api/admin/ai-recipes
 */

import { NextResponse } from "next/server"

// Use Edge runtime for Cloudflare Pages compatibility
export const runtime = "edge"

export async function GET() {
  // Edge runtime compatible response
  // Clients should fetch directly from Firestore using client-side SDK
  return NextResponse.json(
    {
      success: false,
      error: "Admin recipes endpoint not available",
      message: "Use client-side Firestore query to fetch ai_recipes collection",
      note: "On Cloudflare Pages, query ai_recipes directly from client with proper Firestore rules",
    },
    { status: 501 }
  )
}
