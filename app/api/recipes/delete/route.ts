import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth"
import { validateSlug } from "@/lib/validation"
import { clearCacheByNamespace } from "@/lib/cache"

export const runtime = 'edge'

export async function DELETE(request: Request) {
  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await request.json()

    // Validate slug format to prevent path traversal
    const validation = validateSlug(slug)
    if (!validation.valid) {
      console.error("[DELETE /api/recipes/delete] Validation errors:", validation.errors)
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      )
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

    // Delete the file
    const deleteResponse = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete recipe: ${slug}`,
        sha,
        branch: "main",
      }),
    })

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json()
      console.error("[DELETE /api/recipes/delete] GitHub API error:", error)
      return NextResponse.json({ error: "Failed to delete recipe on GitHub" }, { status: 500 })
    }

    // Invalidate cache when recipe is deleted
    clearCacheByNamespace("github")

    console.log("[DELETE /api/recipes/delete] Recipe deleted successfully")
    return NextResponse.json({ success: true, message: "Recipe deleted successfully" })
  } catch (error) {
    console.error("[DELETE /api/recipes/delete] Error:", error)
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 })
  }
}

