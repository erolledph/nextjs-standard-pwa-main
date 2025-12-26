import { NextRequest, NextResponse } from "next/server"
import * as jose from 'jose'

// Use edge runtime for Cloudflare Pages compatibility
export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      )
    }

    const projectId = process.env.FIREBASE_PROJECT_ID
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

    if (!projectId || !privateKey || !clientEmail) {
      console.error("Missing Firebase configuration")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Use REST API directly to fetch recipe from Firestore
    // First, we need an access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await generateJWT(privateKey, clientEmail),
      }).toString(),
    })

    if (!tokenResponse.ok) {
      console.error("Failed to get auth token:", await tokenResponse.text())
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      )
    }

    const { access_token } = await tokenResponse.json() as any

    // Fetch recipe from Firestore (using ai_recipes collection)
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/ai_recipes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )

    if (!response.ok) {
      console.error(`Firestore API error: ${response.status}`, await response.text())
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: "Failed to fetch recipe" },
        { status: 500 }
      )
    }

    const data = await response.json() as any

    // Extract fields from Firestore document format
    const fields = data.fields || {}
    const recipe = {
      title: fields.title?.stringValue || "AI Generated Recipe",
      description: fields.description?.stringValue || "",
      difficulty: fields.difficulty?.stringValue || "Moderate",
      servings: fields.servings?.integerValue ? parseInt(fields.servings.integerValue) : 4,
      prepTime: fields.prepTime?.stringValue || "15 minutes",
      cookTime: fields.cookTime?.stringValue || "30 minutes",
      totalTime: fields.totalTime?.stringValue || "",
      ingredients: fields.ingredients?.arrayValue?.values?.map((item: any) => ({
        item: item.mapValue?.fields?.item?.stringValue || item.mapValue?.fields?.name?.stringValue || "",
        amount: item.mapValue?.fields?.amount?.stringValue || item.mapValue?.fields?.qty?.stringValue || "",
        unit: item.mapValue?.fields?.unit?.stringValue || item.mapValue?.fields?.unit_of_measurement?.stringValue || "",
      })) || [],
      instructions: fields.instructions?.arrayValue?.values?.map((item: any) => 
        item.stringValue || item.mapValue?.fields?.text?.stringValue || ""
      ) || [],
      nutritionInfo: fields.nutritionInfo?.mapValue?.fields || null,
      cuisine: fields.cuisine?.stringValue,
      protein: fields.protein?.stringValue,
      tasteProfile: fields.tasteProfile?.stringValue,
      createdAt: fields.createdAt?.timestampValue,
    }

    return NextResponse.json({
      success: true,
      recipe,
    })
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    )
  }
}

// Generate JWT for Firebase service account using jose (edge runtime compatible)
async function generateJWT(privateKey: string, clientEmail: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  // Convert PEM private key to KeyLike format for jose
  const key = await jose.importPKCS8(privateKey, 'RS256')
  
  // Sign JWT using jose
  const jwt = await jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(key)

  return jwt
}

