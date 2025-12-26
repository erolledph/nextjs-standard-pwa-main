import { NextResponse } from "next/server"
import { fetchContentFromGitHub } from "@/lib/github"

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim() === "") {
      return NextResponse.json({ blog: [], recipes: [] })
    }

    const owner = process.env.GITHUB_OWNER || ""
    const repo = process.env.GITHUB_REPO || ""
    const token = process.env.GITHUB_TOKEN || ""

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "GitHub configuration missing" }, { status: 500 })
    }

    const [blogPosts, recipes] = await Promise.all([
      fetchContentFromGitHub(owner, repo, token, "blog"),
      fetchContentFromGitHub(owner, repo, token, "recipes"),
    ])

    const searchTerm = query.toLowerCase().trim()

    const filterResults = (posts: any[]) => {
      return posts.filter((post) => {
        const titleMatch = post.title.toLowerCase().includes(searchTerm)
        const contentMatch = post.content.toLowerCase().includes(searchTerm)
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchTerm)
        const authorMatch = post.author?.toLowerCase().includes(searchTerm)
        const tagsMatch = post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))

        return titleMatch || contentMatch || excerptMatch || authorMatch || tagsMatch
      })
    }

    const blogResults = filterResults(blogPosts)
    const recipeResults = filterResults(recipes)

    return NextResponse.json({ blog: blogResults, recipes: recipeResults })
  } catch (error) {
    console.error("Error searching posts:", error)
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 })
  }
}

