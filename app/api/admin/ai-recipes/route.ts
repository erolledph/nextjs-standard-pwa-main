/**
 * Get all AI-generated recipes from Firebase
 * Fetches unpublished AI recipes for the admin dashboard
 * 
 * GET /api/admin/ai-recipes
 */

import { NextResponse } from "next/server"

// Use Edge runtime for Cloudflare Pages compatibility
// This route requires Node.js runtime, so it will only work on Vercel or similar platforms
export const runtime = "edge"

export async function GET() {
  // Return error for Cloudflare Pages edge runtime
  // This endpoint is not compatible with edge runtime due to Firebase Admin SDK requirements
  return NextResponse.json(
    {
      error: "This endpoint is not available on Cloudflare Pages",
      message: "Firebase Admin SDK requires Node.js runtime. Deploy to Vercel for this functionality.",
    },
    { status: 503 }
  )
}
