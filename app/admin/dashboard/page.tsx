"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Check, Eye, Pencil, Copy, Trash2, ChefHat, MessageSquare, Mail, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { CacheStatsCard } from "@/components/admin/CacheStatsCard"
import { YouTubeQuotaCard } from "@/components/admin/YouTubeQuotaCard"
import { AIRecipesTab } from "@/components/admin/AIRecipesTab"
import { CommentsTab } from "@/components/admin/CommentsTab"
import { SubscribersTab } from "@/components/admin/SubscribersTab"
import { PaginatedTable } from "@/components/admin/PaginatedTable"
import { typography, responsive, spacing, gradients, interactive } from "@/lib/design-system"
import type { Column } from "@/components/admin/PaginatedTable"

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
  const [totalComments, setTotalComments] = useState(0)
  const [totalSubscribers, setTotalSubscribers] = useState(0)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([])
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
    if (tab && ['overview', 'content', 'recipes', 'ai-recipes', 'stats', 'youtube', 'comments', 'subscribers'].includes(tab)) {
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
        setRecentPosts(posts.slice(0, 5))
      }

      const recipesResponse = await fetch("/api/recipes")
      if (recipesResponse.ok) {
        const recipes = await recipesResponse.json()
        setTotalRecipes(recipes.length)
        setRecentRecipes(recipes.slice(0, 5))
      }

      const commentsResponse = await fetch("/api/admin/comments")
      if (commentsResponse.ok) {
        const comments = await commentsResponse.json()
        setTotalComments(Array.isArray(comments) ? comments.length : 0)
      }

      const subscribersResponse = await fetch("/api/admin/subscribers")
      if (subscribersResponse.ok) {
        const subscribers = await subscribersResponse.json()
        setTotalSubscribers(Array.isArray(subscribers) ? subscribers.length : 0)
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
            <button
              onClick={() => setActiveTab("comments")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "comments"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "subscribers"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Subscribers
            </button>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-6 sm:py-12">
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Stories</CardTitle>
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{totalPosts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Published articles</p>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Recipes</CardTitle>
                    <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{totalRecipes}</div>
                  <p className="text-xs text-muted-foreground mt-1">Shared recipes</p>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Comments</CardTitle>
                    <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{totalComments}</div>
                  <p className="text-xs text-muted-foreground mt-1">Community feedback</p>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Subscribers</CardTitle>
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{totalSubscribers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Email subscribers</p>
                </CardHeader>
              </Card>
            </div>

            {/* Recent Content Section */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Stories</CardTitle>
                      <CardDescription>Your latest published articles</CardDescription>
                    </div>
                    <Link href="/admin/dashboard?tab=content">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">No stories yet</p>
                      <Link href="/admin/create">
                        <Button variant="outline" size="sm">Create First Story</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentPosts.map((post) => (
                        <div key={post.id} className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground line-clamp-1">{post.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(post.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Recipes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Recipes</CardTitle>
                      <CardDescription>Your latest shared recipes</CardDescription>
                    </div>
                    <Link href="/admin/dashboard?tab=recipes">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentRecipes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">No recipes yet</p>
                      <Link href="/admin/create?type=recipes">
                        <Button variant="outline" size="sm">Create First Recipe</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentRecipes.map((recipe) => (
                        <div key={recipe.id} className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground line-clamp-1">{recipe.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(recipe.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <Link href={`/recipes/${recipe.slug}`} target="_blank">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Quick Actions</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <Link href="/admin/create">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 text-xs sm:text-sm">
                    <div className="text-left">
                      <div className="font-semibold mb-0.5 sm:mb-1">Create Story</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Write article</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/blog">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 text-xs sm:text-sm">
                    <div className="text-left">
                      <div className="font-semibold mb-0.5 sm:mb-1">All Stories</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Browse articles</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/create?type=recipes">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 text-xs sm:text-sm">
                    <div className="text-left">
                      <div className="font-semibold mb-0.5 sm:mb-1">Create Recipe</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Share recipe</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/recipes">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 text-xs sm:text-sm">
                    <div className="text-left">
                      <div className="font-semibold mb-0.5 sm:mb-1">All Recipes</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Browse recipes</div>
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
                      <Button>Create New Post</Button>
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
                    <PaginatedTable
                      data={posts}
                      columns={[
                        {
                          key: "image",
                          header: "Image",
                          hideOnMobile: false,
                          render: (post) => (
                            post.image ? (
                              <img src={post.image} alt={post.title} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )
                          ),
                        },
                        {
                          key: "title",
                          header: "Title",
                          render: (post) => (
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{post.title}</p>
                              {post.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.excerpt}</p>
                              )}
                            </div>
                          ),
                        },
                        {
                          key: "date",
                          header: "Date",
                          hideOnMobile: true,
                          render: (post) => new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        },
                        {
                          key: "actions",
                          header: "Actions",
                          render: (post) => (
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
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View post">
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
                          ),
                        },
                      ]}
                      pageSize={10}
                    />
                  )}
                </CardContent>
              </Card>
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
                      <Button>Create New Recipe</Button>
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
                    <PaginatedTable
                      data={recipes}
                      columns={[
                        {
                          key: "image",
                          header: "Image",
                          hideOnMobile: false,
                          render: (recipe) => (
                            recipe.image ? (
                              <img src={recipe.image} alt={recipe.title} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )
                          ),
                        },
                        {
                          key: "title",
                          header: "Title",
                          render: (recipe) => (
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{recipe.title}</p>
                              {recipe.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{recipe.excerpt}</p>
                              )}
                            </div>
                          ),
                        },
                        {
                          key: "date",
                          header: "Date",
                          hideOnMobile: true,
                          render: (recipe) => new Date(recipe.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        },
                        {
                          key: "actions",
                          header: "Actions",
                          render: (recipe) => (
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
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View recipe">
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
                          ),
                        },
                      ]}
                      pageSize={10}
                    />
                  )}
                </CardContent>
              </Card>
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

        {activeTab === "comments" && (
          <CommentsTab />
        )}

        {activeTab === "subscribers" && (
          <SubscribersTab />
        )}
      </div>
    </main>
  )
}
