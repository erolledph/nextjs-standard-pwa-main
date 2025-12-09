/**
 * Save AI-generated recipe to Firebase
 * Saves the recipe and input data for later conversion to recipe posts
 *
 * POST /api/ai-chef/save-recipe
 * Body: { recipe, input }
 */

import { NextResponse, type NextRequest } from "next/server"

// Use Edge runtime for Cloudflare Pages compatibility
// This route requires Node.js runtime, so it will only work on Vercel or similar platforms
export const runtime = "edge"

export async function POST(request: NextRequest) {
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
