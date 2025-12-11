import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth"
import { validateSlug } from "@/lib/validation"
import { clearCacheByNamespace } from "@/lib/cache"

export const runtime = 'edge'

export async function PUT(request: Request) {
  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      slug, 
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
      difficulty 
    } = await request.json()

    console.log("[PUT /api/recipes/update] Received data:", {
      slug,
      titleLength: title?.length,
      contentLength: content?.length,
      prepTimeLength: prepTime?.length,
      cookTimeLength: cookTime?.length,
      servingsLength: servings?.length,
      ingredientsLength: Array.isArray(ingredients) ? ingredients.length : 0,
      difficulty,
    })

    // Validate slug format to prevent path traversal
    const validation = validateSlug(slug)
    if (!validation.valid) {
      console.error("[PUT /api/recipes/update] Validation errors:", validation.errors)
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      )
    }

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "GitHub configuration missing" }, { status: 500 })
    }

    const filename = `${slug}.md`
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/posts/recipes/${filename}`

    // First, get the file SHA
    const getResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to fetch recipe from GitHub" }, { status: 500 })
    }

    const fileData = await getResponse.json()
    const sha = fileData.sha

    // Parse the existing content to get the date (edge-compatible)
    const base64Content = fileData.content.replace(/\s/g, '')
    const binaryString = atob(base64Content)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    const existingContent = decoder.decode(bytes)
    const dateMatch = existingContent.match(/date:\s*(.+)/)
    const existingDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split("T")[0]

    // Create frontmatter with recipe metadata and existing date
    const tagsStr = tags && Array.isArray(tags) ? tags.join(", ") : ""
<<<<<<< HEAD
    // Store as JSON arrays for reliable parsing
    const ingredientsStr = Array.isArray(ingredients) ? JSON.stringify(ingredients) : "[]"
    const instructionsStr = Array.isArray(instructions) ? JSON.stringify(instructions) : "[]"
=======
    const ingredientsStr = Array.isArray(ingredients) ? ingredients.join(", ") : ""
    
    // Format instructions as a numbered list with indentation for the custom parser
    const instructionsStr = Array.isArray(instructions)
      ? "\n" + instructions.map((inst: string, idx: number) => `  ${idx + 1}. ${inst}`).join("\n")
      : ""
>>>>>>> 5f4eae8c208402e3a2c2d3a70c653a959455f4c6

    const frontmatter = `---
title: ${title}
date: ${existingDate}
author: ${author || "Your Name"}
excerpt: ${excerpt || ""}
tags: ${tagsStr}
image: ${image || ""}
prepTime: ${prepTime || ""}
cookTime: ${cookTime || ""}
servings: ${servings || ""}
ingredients: ${ingredientsStr}
instructions:${instructionsStr}
difficulty: ${difficulty || "Easy"}
---

${content}
`

    // Update the file
    // Convert to base64 using TextEncoder (edge-compatible)
    const encoder = new TextEncoder()
    const data = encoder.encode(frontmatter)

    // Convert Uint8Array to base64 without spreading (edge-compatible)
    let binary = ''
    const len = data.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(data[i])
    }
    const base64Frontmatter = btoa(binary)

    const updateResponse = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update recipe: ${title}`,
        content: base64Frontmatter,
        sha,
        branch: "main",
      }),
    })

    if (!updateResponse.ok) {
      const error = await updateResponse.json()
      console.error("[PUT /api/recipes/update] GitHub API error:", error)
      return NextResponse.json({ error: "Failed to update recipe on GitHub" }, { status: 500 })
    }

<<<<<<< HEAD
    // Invalidate all relevant caches when recipe is updated
    clearCacheByNamespace("github")
    clearCacheByNamespace("recipes")

    const result = await updateResponse.json()
    console.log("[PUT /api/recipes/update] Recipe updated successfully:", slug)
=======
    // Invalidate cache when recipe is updated
    clearCacheByNamespace("github")

    const result = await updateResponse.json()
    console.log("[PUT /api/recipes/update] Recipe updated successfully")
>>>>>>> 5f4eae8c208402e3a2c2d3a70c653a959455f4c6
    return NextResponse.json({ success: true, data: result, message: "Recipe updated successfully" })
  } catch (error) {
    console.error("[PUT /api/recipes/update] Error:", error)
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 })
  }
}
