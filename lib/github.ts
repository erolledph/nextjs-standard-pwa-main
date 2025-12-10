interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  type: "file" | "dir"
  content?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
}

export interface Recipe extends BlogPost {
  prepTime?: string
  cookTime?: string
  servings?: string
  ingredients?: string[]
  instructions?: string[]
  difficulty?: string
}

type ContentType = "blog" | "recipes"

const GITHUB_API = "https://api.github.com"

// Import cache utilities
import { getCached, setCached, clearCacheByNamespace } from "./cache"

// Generic function to fetch any content type
export async function fetchContentFromGitHub(
  owner: string,
  repo: string,
  token: string,
  contentType: ContentType = "blog",
): Promise<BlogPost[] | Recipe[]> {
  const contentDir = contentType === "recipes" ? "posts/recipes" : "posts/blog"
  
  try {
    if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
      try {
        const fs = await import("fs/promises")
        const path = await import("path")

        const localContentDir = path.join(process.cwd(), contentDir)

        try {
          const files = await fs.readdir(localContentDir)
          const mdFiles = files.filter((f: string) => f.endsWith(".md"))

          const content: (BlogPost | Recipe)[] = []

          for (const file of mdFiles) {
            const filePath = path.join(localContentDir, file)
            const fileContent = await fs.readFile(filePath, "utf-8")
            const parsed = parseMarkdownContent(file, fileContent, contentType)
            content.push(parsed)
          }

          return content.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        } catch (localError) {
          console.log(`Local ${contentType} not found, falling back to GitHub`)
        }
      } catch (fsError) {
        console.log("Node.js fs not available, using GitHub API only")
      }
    }

    // Check cache first (5 minute TTL for production)
    const cacheKey = `github:${contentType}:${owner}:${repo}`
    const cached = getCached<BlogPost[] | Recipe[]>(cacheKey)
    if (cached) {
      console.log(`[Cache HIT] GitHub ${contentType} list`)
      return cached
    }

    console.log(`[Cache MISS] GitHub ${contentType} list - fetching from API`)

    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${contentDir}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) throw new Error(`Failed to fetch ${contentType} directory`)

    const files = (await response.json()) as GitHubFile[]
    const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"))

    const content: (BlogPost | Recipe)[] = []

    for (const file of mdFiles) {
      const contentResponse = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${file.path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!contentResponse.ok) continue

      const data = (await contentResponse.json()) as GitHubFile
      if (!data.content) continue

      // Edge-compatible base64 decoding
      const base64Content = data.content.replace(/\s/g, '')
      const binaryString = atob(base64Content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const decoder = new TextDecoder()
      const fileContent = decoder.decode(bytes)

      const parsed = parseMarkdownContent(file.name, fileContent, contentType)
      content.push(parsed)
    }

    const sorted = content.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Cache the results (5 minutes = 300000ms)
    setCached(cacheKey, sorted, { ttl: 5 * 60 * 1000 })

    return sorted
  } catch (error) {
    console.error(`GitHub fetch error for ${contentType}:`, error)
    return []
  }
}

// Keep the old function for backwards compatibility
export async function fetchPostsFromGitHub(
  owner: string,
  repo: string,
  token: string,
  postsDir = "posts/blog",
): Promise<BlogPost[]> {
  return (await fetchContentFromGitHub(owner, repo, token, "blog")) as BlogPost[]
}

function parseMarkdownContent(
  filename: string,
  content: string,
  contentType: ContentType = "blog",
): BlogPost | Recipe {
  const slug = filename.replace(".md", "")

  // Parse frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  const frontmatter: Record<string, string> = {}
  let body = content

  if (match) {
    const frontmatterStr = match[1]
    body = match[2]

    // Simple YAML parsing with basic multiline support
    const lines = frontmatterStr.split("\n")
    let currentKey = ""

    lines.forEach((line) => {
      if (!line.trim()) return

      // Check for indentation (continuation of previous key)
      if (line.match(/^\s+/) && currentKey) {
        frontmatter[currentKey] += "\n" + line.trim()
      } else {
        const parts = line.split(":")
        const key = parts[0]
        const value = parts.slice(1).join(":")

        if (key) {
          currentKey = key.trim()
          frontmatter[currentKey] = value.trim()
        }
      }
    })
  }

  const title = frontmatter.title || slug
  const excerpt = frontmatter.excerpt || body.substring(0, 160).replace(/[#*`]/g, "")
  const date = frontmatter.date || new Date().toISOString()
  const author = frontmatter.author || "Anonymous"
  const tags = frontmatter.tags ? frontmatter.tags.split(",").map((t) => t.trim()) : []
  const image = frontmatter.image || ""

  const basePost: BlogPost = {
    id: slug,
    title,
    slug,
    content: body,
    excerpt,
    date,
    author,
    tags,
    image,
  }

  if (contentType === "recipes") {
    const prepTime = frontmatter.prepTime || ""
    const cookTime = frontmatter.cookTime || ""
    const servings = frontmatter.servings || ""
    const difficulty = frontmatter.difficulty || "Medium"
    
    // Parse ingredients (can be comma-separated or newline in frontmatter)
    let ingredients: string[] = []
    if (frontmatter.ingredients) {
      ingredients = frontmatter.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0)
    }

    // Parse instructions (can be newline-separated numbered steps)
    let instructions: string[] = []
    if (frontmatter.instructions) {
      if (typeof frontmatter.instructions === 'string') {
        // Remove numbering like "1. ", "2. " etc and split by newlines
        instructions = frontmatter.instructions
          .split("\n")
          .map((inst: string) => inst.replace(/^\d+\.\s*/, '').trim())
          .filter((inst: string) => inst.length > 0)
      } else if (Array.isArray(frontmatter.instructions)) {
        instructions = frontmatter.instructions
      }
    }

    return {
      ...basePost,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions,
      difficulty,
    } as Recipe
  }

  return basePost
}

// Keep old parsing function for backwards compatibility
function parseMarkdownPost(filename: string, content: string): BlogPost {
  return parseMarkdownContent(filename, content, "blog") as BlogPost
}
