"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Check, Eye, Pencil, Copy, Trash2, ChefHat } from "lucide-react"
import { toast } from "sonner"
import { CacheStatsCard } from "@/components/admin/CacheStatsCard"
import { YouTubeQuotaCard } from "@/components/admin/YouTubeQuotaCard"
import { AIRecipesTab } from "@/components/admin/AIRecipesTab"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags?: string[]
  image?: string
}

interface Recipe extends BlogPost {
  prepTime?: string
  cookTime?: string
  servings?: string
  ingredients?: string[]
  difficulty?: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalRecipes, setTotalRecipes] = useState(0)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [deletingPost, setDeletingPost] = useState<string | null>(null)
  const [deletingRecipe, setDeletingRecipe] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchStats()

    // Check for tab query parameter
    const searchParams = new URLSearchParams(window.location.search)
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'content', 'recipes', 'ai-recipes', 'stats', 'youtube'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "content") {
      fetchPosts()
    } else if (activeTab === "recipes") {
      fetchRecipes()
    }
  }, [activeTab])

  async function fetchStats() {
    try {
      const postsResponse = await fetch("/api/posts")
      if (postsResponse.ok) {
        const posts = await postsResponse.json()
        setTotalPosts(posts.length)
      }

      const recipesResponse = await fetch("/api/recipes")
      if (recipesResponse.ok) {
        const recipes = await recipesResponse.json()
        setTotalRecipes(recipes.length)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  async function fetchPosts() {
    setLoadingPosts(true)
    try {
      const response = await fetch("/api/posts")
      if (!response.ok) throw new Error("Failed to fetch posts")
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoadingPosts(false)
    }
  }

  async function fetchRecipes() {
    setLoadingRecipes(true)
    try {
      const response = await fetch("/api/recipes")
      if (!response.ok) throw new Error("Failed to fetch recipes")
      const data = await response.json()
      setRecipes(data)
    } catch (error) {
      console.error("Error fetching recipes:", error)
      toast.error("Failed to load recipes")
    } finally {
      setLoadingRecipes(false)
    }
  }

  async function handleDeletePost(slug: string, title: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingPost(slug)
    try {
      const response = await fetch("/api/posts/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete post")
      }

      toast.success("Post deleted successfully")
      await fetchPosts()
      await fetchStats()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete post")
    } finally {
      setDeletingPost(null)
    }
  }

  async function handleDeleteRecipe(slug: string, title: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingRecipe(slug)
    try {
      const response = await fetch("/api/recipes/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete recipe")
      }

      toast.success("Recipe deleted successfully")
      await fetchRecipes()
      await fetchStats()
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete recipe")
    } finally {
      setDeletingRecipe(null)
    }
  }

  function handleEditPost(slug: string) {
    router.push(`/admin/edit/${slug}`)
  }

  function handleEditRecipe(slug: string) {
    router.push(`/admin/edit/${slug}?type=recipes`)
  }

  function handleCopyPostUrl(slug: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
    const postUrl = `${siteUrl}/blog/${slug}`
    navigator.clipboard.writeText(postUrl)
    setCopiedSlug(slug)
    toast.success("URL copied to clipboard!")
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  function handleCopyRecipeUrl(slug: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
    const recipeUrl = `${siteUrl}/recipes/${slug}`
    navigator.clipboard.writeText(recipeUrl)
    setCopiedSlug(slug)
    toast.success("URL copied to clipboard!")
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-shadow-gray bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Georgia, serif' }}>Admin Dashboard</h1>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <Link href="/">
                <Button variant="ghost" size="sm" className="sm:h-9">View Site</Button>
              </Link>
              <Button variant="outline" size="sm" className="sm:h-9" onClick={handleLogout} disabled={loading}>
                {loading ? "Logging out..." : "Sign out"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4 border-shadow-gray overflow-x-auto pb-0 -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "content"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "recipes"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => setActiveTab("ai-recipes")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "ai-recipes"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AI Generated
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "stats"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab("youtube")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "youtube"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              YouTube
            </button>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-6 sm:py-12">
        {activeTab === "overview" && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Blog Posts</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{totalPosts}</div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Recipes</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{totalRecipes}</div>
                </CardHeader>
              </Card>
            </div>

            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Quick Actions</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <Link href="/admin/create">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="text-left">
                      <div className="font-semibold mb-1">Create New Story</div>
                      <div className="text-sm text-muted-foreground">Start writing your next article</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/blog">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="text-left">
                      <div className="font-semibold mb-1">View All Stories</div>
                      <div className="text-sm text-muted-foreground">Browse published articles</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/create?type=recipes">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="text-left">
                      <div className="font-semibold mb-1">Create New Recipe</div>
                      <div className="text-sm text-muted-foreground">Share a delicious recipe</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/recipes">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="text-left">
                      <div className="font-semibold mb-1">View All Recipes</div>
                      <div className="text-sm text-muted-foreground">Browse published recipes</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            {loadingPosts ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground mt-3">Loading posts...</p>
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Blog Posts
                          <span className="text-sm font-normal text-muted-foreground">
                            ({posts.length})
                          </span>
                        </CardTitle>
                        <CardDescription>Manage your blog content</CardDescription>
                      </div>
                      <Link href="/admin/create">
                        <Button>
                          Create New Post
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                  {posts.length === 0 ? (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground mb-4">No posts yet</p>
                      <Link href="/admin/create">
                        <Button>Create your first post</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-shadow-gray bg-muted/30">
                            <th className="text-left px-4 py-3 font-semibold text-foreground w-24">Image</th>
                            <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                            <th className="text-left px-4 py-3 font-semibold text-foreground w-32">Date</th>
                            <th className="text-center px-4 py-3 font-semibold text-foreground w-32">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.map((post) => (
                            <tr key={post.id} className="border-b border-shadow-gray hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                {post.image ? (
                                  <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-foreground line-clamp-1">{post.title}</p>
                                  {post.excerpt && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.excerpt}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {new Date(post.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    title="Copy post URL"
                                    onClick={() => handleCopyPostUrl(post.slug)}
                                  >
                                    {copiedSlug === post.slug ? (
                                      <Check className="w-4 h-4 text-primary" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Link href={`/blog/${post.slug}`} target="_blank">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      title="View post"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    title="Edit post"
                                    onClick={() => handleEditPost(post.slug)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    title="Delete post"
                                    onClick={() => handleDeletePost(post.slug, post.title)}
                                    disabled={deletingPost === post.slug}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
              </>
            )}
          </div>
        )}

        {activeTab === "recipes" && (
          <div className="space-y-6">
            {loadingRecipes ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground mt-3">Loading recipes...</p>
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Recipes
                          <span className="text-sm font-normal text-muted-foreground">
                            ({recipes.length})
                          </span>
                        </CardTitle>
                        <CardDescription>Manage your recipes</CardDescription>
                      </div>
                      <Link href="/admin/create?type=recipes">
                        <Button>
                          Create New Recipe
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                  {recipes.length === 0 ? (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground mb-4">No recipes yet</p>
                      <Link href="/admin/create?type=recipes">
                        <Button>Create your first recipe</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-shadow-gray bg-muted/30">
                            <th className="text-left px-4 py-3 font-semibold text-foreground w-24">Image</th>
                            <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                            <th className="text-left px-4 py-3 font-semibold text-foreground w-32">Date</th>
                            <th className="text-center px-4 py-3 font-semibold text-foreground w-32">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipes.map((recipe) => (
                            <tr key={recipe.id} className="border-b border-shadow-gray hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                {recipe.image ? (
                                  <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-foreground line-clamp-1">{recipe.title}</p>
                                  {recipe.excerpt && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{recipe.excerpt}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {new Date(recipe.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    title="Copy recipe URL"
                                    onClick={() => handleCopyRecipeUrl(recipe.slug)}
                                  >
                                    {copiedSlug === recipe.slug ? (
                                      <Check className="w-4 h-4 text-primary" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Link href={`/recipes/${recipe.slug}`} target="_blank">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      title="View recipe"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    title="Edit recipe"
                                    onClick={() => handleEditRecipe(recipe.slug)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    title="Delete recipe"
                                    onClick={() => handleDeleteRecipe(recipe.slug, recipe.title)}
                                    disabled={deletingRecipe === recipe.slug}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
              </>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <CacheStatsCard />
        )}

        {activeTab === "ai-recipes" && (
          <AIRecipesTab />
        )}

        {activeTab === "youtube" && (
          <YouTubeQuotaCard />
        )}
      </div>
    </main>
  )
}
