import { NextResponse } from "next/server"
import { fetchContentFromGitHub } from "@/lib/github"
import { isAdminAuthenticated } from "@/lib/auth"

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    // For Cloudflare Pages Edge Runtime, use globalThis or request context
    const owner = (globalThis as any).GITHUB_OWNER || process.env.GITHUB_OWNER || ""
    const repo = (globalThis as any).GITHUB_REPO || process.env.GITHUB_REPO || ""
    const token = (globalThis as any).GITHUB_TOKEN || process.env.GITHUB_TOKEN || ""

    console.log("[GET /api/recipes] Environment check:", {
      hasOwner: !!owner,
      hasRepo: !!repo,
      hasToken: !!token,
    })

    if (!owner || !repo || !token) {
      console.error("[GET /api/recipes] Missing environment variables!")
      return NextResponse.json({
        error: "GitHub configuration missing",
        details: {
          owner: !!owner,
          repo: !!repo,
          token: !!token
        }
      }, { status: 500 })
    }

    console.log("[GET /api/recipes] Fetching recipes from GitHub...")
    const recipes = await fetchContentFromGitHub(owner, repo, token, "recipes")
    console.log("[GET /api/recipes] Successfully fetched", recipes.length, "recipes")
    
    // Support slug query parameter for fetching a single recipe
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')
    
    if (slug) {
      const recipe = recipes.find(r => r.slug === slug)
      if (!recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
      }
      return NextResponse.json(recipe)
    }
    
    return NextResponse.json(recipes)
  } catch (error) {
    console.error("[GET /api/recipes] Error:", error)
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("[POST /api/recipes] Starting recipe creation...")

    const authenticated = await isAdminAuthenticated()
    console.log("[POST /api/recipes] Authentication check:", authenticated)

    if (!authenticated) {
      console.error("[POST /api/recipes] Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      title, 
      author, 
      excerpt, 
      tags, 
      image, 
      content, 
      prepTime, 
      cookTime, 
      servings, 
      ingredients, 
      instructions,
      difficulty,
      ai_recipe_id
    } = await request.json()

    console.log("[POST /api/recipes] Recipe data received:", {
      hasTitle: !!title,
      hasContent: !!content,
      titleLength: title?.length || 0,
      contentLength: content?.length || 0
    })

    if (!title || !content) {
      console.error("[POST /api/recipes] Missing required fields")
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Get environment variables
    const owner = (globalThis as any).GITHUB_OWNER || process.env.GITHUB_OWNER || ""
    const repo = (globalThis as any).GITHUB_REPO || process.env.GITHUB_REPO || ""
    const token = (globalThis as any).GITHUB_TOKEN || process.env.GITHUB_TOKEN || ""

    console.log("[POST /api/recipes] Environment check:", {
      hasOwner: !!owner,
      hasRepo: !!repo,
      hasToken: !!token
    })

    if (!owner || !repo || !token) {
      console.error("[POST /api/recipes] Missing environment variables!")
      return NextResponse.json({
        error: "GitHub configuration missing",
        details: {
          owner: !!owner,
          repo: !!repo,
          token: !!token
        }
      }, { status: 500 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const date = new Date().toISOString().split("T")[0]
    const filename = `${slug}.md`

    // Build ingredients list as JSON array
    const ingredientsList = Array.isArray(ingredients) 
      ? JSON.stringify(ingredients)
      : "[]"

    // Build instructions list as JSON array
    const instructionsList = Array.isArray(instructions)
      ? JSON.stringify(instructions)
      : "[]"

    const frontmatter = `---
title: ${title}
date: ${date}
author: ${author || "Admin"}
excerpt: ${excerpt || ""}
tags: ${Array.isArray(tags) ? tags.join(", ") : tags || ""}
image: ${image || ""}
prepTime: ${prepTime || ""}
cookTime: ${cookTime || ""}
servings: ${servings || ""}
ingredients: ${ingredientsList}
instructions: ${instructionsList}
difficulty: ${difficulty || "Medium"}
${ai_recipe_id ? `ai_recipe_id: ${ai_recipe_id}` : ""}
---

${content}
`

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/posts/recipes/${filename}`
    console.log("[POST /api/recipes] GitHub API URL:", apiUrl)
    console.log("[POST /api/recipes] Creating recipe:", { slug, filename })

    // Convert to base64 using TextEncoder (edge-compatible)
    const encoder = new TextEncoder()
    const data = encoder.encode(frontmatter)

    // Convert Uint8Array to base64 without spreading (edge-compatible)
    let binary = ''
    const len = data.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(data[i])
    }
    const base64Content = btoa(binary)

    // First, try to get the file if it exists to get its SHA
    let fileSha = undefined
    try {
      console.log("[POST /api/recipes] Checking if file exists...")
      const checkResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json()
        fileSha = existingFile.sha
        console.log("[POST /api/recipes] File exists, SHA:", fileSha)
      }
    } catch (error) {
      console.log("[POST /api/recipes] File doesn't exist (expected for new recipes)")
    }

    console.log("[POST /api/recipes] Sending request to GitHub...")
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add recipe: ${title}`,
        content: base64Content,
        branch: "main",
        ...(fileSha && { sha: fileSha }),
      }),
    })

    console.log("[POST /api/recipes] GitHub response status:", response.status, response.statusText)

    if (!response.ok) {
      const error = await response.json()
      console.error("[POST /api/recipes] GitHub API error:", {
        status: response.status,
        statusText: response.statusText,
        error: error
      })
      return NextResponse.json({
        error: "Failed to create recipe on GitHub",
        details: error,
        status: response.status
      }, { status: 500 })
    }

    const result = await response.json()
    console.log("[POST /api/recipes] Recipe created successfully:", result.content?.path)
    
    // Firebase save is not available on Cloudflare Pages (edge runtime)
    console.log("[POST /api/recipes] Recipe saved to GitHub (Firebase not available on this deployment)")
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[POST /api/recipes] Unexpected error:", error)
    return NextResponse.json({
      error: "Failed to create recipe",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
