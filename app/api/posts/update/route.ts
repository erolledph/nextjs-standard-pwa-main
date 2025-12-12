import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth"
import { validateBlogPost } from "@/lib/validation"
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

    const { slug, title, author, excerpt, tags, image, content } = await request.json()

    // Default author to Your Name if empty
    const finalAuthor = author?.trim() || "Your Name"

    // Validate input
    const validation = validateBlogPost({
      slug,
      title,
      author: finalAuthor,
      excerpt,
      tags,
      image,
      content
    })

    if (!validation.valid) {
      throw new ApiError(
        400,
        validation.errors.join("; "),
        "VALIDATION_FAILED"
      )
    }

    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    if (!owner || !repo || !token) {
      throw new ApiError(500, "GitHub configuration missing", "CONFIG_ERROR")
    }

    const filename = `${slug}.md`
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/posts/${filename}`

    // First, get the file SHA
    const getResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        throw new ApiError(404, "Post not found", "NOT_FOUND")
      }
      throw new ApiError(500, "Failed to fetch post from GitHub", "GITHUB_ERROR")
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

    // Create frontmatter with existing date
    const frontmatter = `---
title: ${title}
date: ${existingDate}
author: ${finalAuthor}
excerpt: ${excerpt || ""}
tags: ${tags && Array.isArray(tags) ? tags.join(", ") : ""}
image: ${image || ""}
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
        message: `Update post: ${title}`,
        content: base64Frontmatter,
        sha,
        branch: "main",
      }),
    })

    if (!updateResponse.ok) {
      const error = await updateResponse.json()
      console.error("GitHub API error:", error)
      return NextResponse.json({ error: "Failed to update post on GitHub" }, { status: 500 })
    }

    // Invalidate cache when post is updated
    clearCacheByNamespace("github")

    const result = await updateResponse.json()
    return NextResponse.json({ success: true, data: result, message: "Post updated successfully" })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

