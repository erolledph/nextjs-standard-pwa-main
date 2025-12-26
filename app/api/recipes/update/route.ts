import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth"
import { validateSlug } from "@/lib/validation"
import { clearCacheByNamespace } from "@/lib/cache"
import { handleApiError, ApiError } from "@/lib/api-error-handler"

export const runtime = 'edge'

export async function PUT(request: Request) {
  const requestId = crypto.randomUUID()

  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      throw new ApiError(401, "Unauthorized", "UNAUTHORIZED")
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

    // Validate slug format to prevent path traversal
    const validation = validateSlug(slug)
    if (!validation.valid) {
      throw new ApiError(
        400,
        validation.errors.join("; "),
        "VALIDATION_FAILED"
      )
    }

    if (!title || !content) {
      throw new ApiError(400, "Title and content are required", "MISSING_FIELDS")
    }

    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    if (!owner || !repo || !token) {
      throw new ApiError(500, "GitHub configuration missing", "CONFIG_ERROR")
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
        throw new ApiError(404, "Recipe not found", "NOT_FOUND")
      }
      throw new ApiError(500, "Failed to fetch recipe from GitHub", "GITHUB_ERROR")
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
    // Store as JSON arrays for reliable parsing
    const ingredientsStr = Array.isArray(ingredients) ? JSON.stringify(ingredients) : "[]"
    const instructionsStr = Array.isArray(instructions) ? JSON.stringify(instructions) : "[]"

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
      throw new ApiError(500, "Failed to update recipe on GitHub", "GITHUB_ERROR")
    }

    // Invalidate all relevant caches when recipe is updated
    clearCacheByNamespace("github")
    clearCacheByNamespace("recipes")

    const result = await updateResponse.json()
    return NextResponse.json({ success: true, data: result, message: "Recipe updated successfully" })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

