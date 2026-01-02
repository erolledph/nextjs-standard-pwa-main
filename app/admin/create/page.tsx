"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, Link2, List, ListOrdered, Heading1, Heading2, Code, Quote, Eye, EyeOff, Image, Plus, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { toast } from "sonner"

function CreatePostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [contentType, setContentType] = useState<"blog" | "recipes">("blog")
  const [aiRecipeId, setAiRecipeId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    author: "Your Name",
    excerpt: "",
    tags: "",
    image: "",
    content: "",
    // Recipe-specific fields
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: [""],
    instructions: [""],
    difficulty: "Easy",
  })

  // Helper function to populate form from AI data
  const populateFormFromAiData = (data: any) => {
    try {
      // Track AI recipe ID for marking as converted
      // Check both aiRecipeId and id (id is used in localStorage object)
      if (data.aiRecipeId) {
        setAiRecipeId(data.aiRecipeId)
      } else if (data.id) {
        setAiRecipeId(data.id)
      }

      // Parse ingredients - they come as a formatted string from AIRecipesTab or raw array
      let parsedIngredients: string[] = [""]
      if (data.ingredients) {
        if (typeof data.ingredients === "string") {
          // String format: "Item - amount unit\nItem2 - amount unit"
          parsedIngredients = data.ingredients
            .split("\n")
            .map((ing: string) => ing.trim())
            .filter(Boolean)
        } else if (Array.isArray(data.ingredients)) {
          // Array format - map to string
          parsedIngredients = data.ingredients
            .map((ing: any) => {
              if (typeof ing === "string") return ing
              const item = ing.item || ""
              const amount = ing.amount || ""
              const unit = ing.unit || ""
              if (amount && unit) return `${item} - ${amount} ${unit}`
              if (amount) return `${item} - ${amount}`
              if (unit) return `${item} - ${unit}`
              return item
            })
            .filter(Boolean)
        }
      }

      // Parse tags - can be array or comma-separated string
      let parsedTags = ""
      if (data.tags) {
        if (Array.isArray(data.tags)) {
          parsedTags = data.tags.join(", ")
        } else if (typeof data.tags === "string") {
          parsedTags = data.tags
        }
      }

      // Parse instructions - can be array or string
      let parsedInstructions: string[] = [""]
      if (data.instructions) {
        if (Array.isArray(data.instructions)) {
          parsedInstructions = data.instructions.filter(Boolean)
        } else if (typeof data.instructions === "string") {
          parsedInstructions = data.instructions
            .split("\n")
            .map((inst: string) => inst.trim())
            .filter(Boolean)
        }
      }

      // Pre-fill form with AI recipe data
      setFormData(prev => ({
        ...prev,
        title: data.title || "",
        excerpt: data.excerpt || "",
        prepTime: data.prepTime || "",
        cookTime: data.cookTime || "",
        servings: data.servings || "",
        ingredients: parsedIngredients.length > 0 ? parsedIngredients : [""],
        instructions: parsedInstructions.length > 0 ? parsedInstructions : [""],
        difficulty: data.difficulty || "Easy",
        content: data.content || "",
        tags: parsedTags,
        image: data.imageUrl || data.image || "",
      }))

      // Set content type to recipes
      setContentType("recipes")
    } catch (error) {
      console.error("Failed to populate form from AI data:", error)
    }
  }

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "recipes") {
      setContentType("recipes")
    }

    // 1. Try to get data from query parameter (legacy/direct link)
    const aiData = searchParams.get("ai")
    if (aiData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(aiData))
        populateFormFromAiData(decodedData)
      } catch (error) {
        console.error("Failed to parse AI recipe data from URL:", error)
      }
    } else {
      // 2. Try to get data from localStorage (from AIRecipesTab convert button)
      try {
        const storedRecipe = localStorage.getItem("ai-recipe-to-convert")
        if (storedRecipe) {
          const decodedData = JSON.parse(storedRecipe)
          populateFormFromAiData(decodedData)

          // Clear localStorage so it doesn't persist on refresh/revisit
          localStorage.removeItem("ai-recipe-to-convert")
        }
      } catch (error) {
        console.error("Failed to parse AI recipe data from localStorage:", error)
      }
    }
  }, [searchParams])

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end)

    setFormData({ ...formData, content: newText })

    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const insertImage = () => {
    insertMarkdown("![Alt text](", ")")
  }

  const markdownTools = [
    { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertMarkdown("*", "*") },
    { icon: Heading1, label: "Heading 1", action: () => insertMarkdown("# ") },
    { icon: Heading2, label: "Heading 2", action: () => insertMarkdown("## ") },
    { icon: Link2, label: "Link", action: () => insertMarkdown("[", "](url)") },
    { icon: List, label: "Bullet List", action: () => insertMarkdown("- ") },
    { icon: ListOrdered, label: "Numbered List", action: () => insertMarkdown("1. ") },
    { icon: Code, label: "Code", action: () => insertMarkdown("`", "`") },
    { icon: Quote, label: "Quote", action: () => insertMarkdown("> ") },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const endpoint = contentType === "recipes" ? "/api/recipes" : "/api/posts"
      
      const body = contentType === "recipes" ? {
        title: formData.title,
        author: formData.author,
        excerpt: formData.excerpt,
        tags: tagsArray,
        image: formData.image,
        content: formData.content,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        ingredients: formData.ingredients.filter(ing => ing.trim().length > 0),
        instructions: formData.instructions.filter(inst => inst.trim().length > 0),
        difficulty: formData.difficulty,
        ...(aiRecipeId && { ai_recipe_id: aiRecipeId }),
      } : {
        title: formData.title,
        author: formData.author,
        excerpt: formData.excerpt,
        tags: tagsArray,
        image: formData.image,
        content: formData.content,
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to create ${contentType === "recipes" ? "recipe" : "post"}`)
      }

      toast.success(`${contentType === "recipes" ? "Recipe" : "Post"} created successfully!`)
      router.push(`/admin/dashboard?tab=${contentType === "recipes" ? "recipes" : "content"}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to create ${contentType === "recipes" ? "recipe" : "post"}`
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="container mx-auto xl:px-5 max-w-screen-lg">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create {contentType === "recipes" ? "Recipe" : "Post"}</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Write and publish a new {contentType === "recipes" ? "recipe" : "blog post"}</p>
          </div>
          <Link href={`/admin/dashboard?tab=${contentType === "recipes" ? "recipes" : "content"}`} className="flex-shrink-0">
            <Button variant="outline" size="sm" className="sm:h-9 w-full sm:w-auto">Cancel</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New {contentType === "recipes" ? "Recipe" : "Blog Post"}</CardTitle>
            <CardDescription>Create a new {contentType === "recipes" ? "recipe with metadata" : "post with markdown formatting"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {aiRecipeId && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      ✨ Recipe pre-filled from AI Generation
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Review and customize the recipe details as needed. Add an image before publishing.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={contentType === "recipes" ? "Recipe name (e.g., Beef Burger Steak)" : "Post title"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder={contentType === "recipes" ? "Brief description of the recipe" : "Brief summary of the post"}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                />
              </div>

              {contentType === "recipes" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime">Prep Time</Label>
                      <Input
                        id="prepTime"
                        placeholder="e.g., 15 minutes"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cookTime">Cook Time</Label>
                      <Input
                        id="cookTime"
                        placeholder="e.g., 20 minutes"
                        value={formData.cookTime}
                        onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        id="servings"
                        placeholder="e.g., 4"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "Easy" | "Medium" | "Hard" })}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        required
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ingredients</Label>
                    <div className="space-y-2">
                      {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Ingredient ${index + 1} (e.g., 1 lb ground beef)`}
                            value={ingredient}
                            onChange={(e) => {
                              const newIngredients = [...formData.ingredients]
                              newIngredients[index] = e.target.value
                              setFormData({ ...formData, ingredients: newIngredients })
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newIngredients = formData.ingredients.filter((_, i) => i !== index)
                              setFormData({ ...formData, ingredients: newIngredients.length > 0 ? newIngredients : [""] })
                            }}
                            disabled={formData.ingredients.length === 1}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, ingredients: [...formData.ingredients, ""] })}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Ingredient
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Add each ingredient on a separate line</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <div className="space-y-2">
                      {formData.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-10 bg-muted rounded text-sm font-medium">
                            {index + 1}
                          </div>
                          <Textarea
                            placeholder={`Step ${index + 1} (e.g., Preheat oven to 350°F)`}
                            value={instruction}
                            onChange={(e) => {
                              const newInstructions = [...formData.instructions]
                              newInstructions[index] = e.target.value
                              setFormData({ ...formData, instructions: newInstructions })
                            }}
                            rows={2}
                            className="resize-none"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newInstructions = formData.instructions.filter((_, i) => i !== index)
                              setFormData({ ...formData, instructions: newInstructions.length > 0 ? newInstructions : [""] })
                            }}
                            disabled={formData.instructions.length === 1}
                            className="flex-shrink-0 h-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, instructions: [...formData.instructions, ""] })}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Instruction
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Add each instruction step in order</p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Header Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the full URL of your featured image (e.g., https://example.com/image.jpg). Recommended size: 1200x630px
                </p>
                {formData.image && (
                  <div className="mt-2 rounded-md border border-shadow-gray overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <div className="border border-input rounded-md overflow-hidden">
                  <div className="flex items-center justify-between gap-1 p-2 bg-muted/30 border-b border-shadow-gray">
                    <div className="flex items-center gap-1 flex-wrap">
                      {markdownTools.map((tool) => (
                        <Button
                          key={tool.label}
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={tool.action}
                          title={tool.label}
                          className="h-8 w-8"
                        >
                          <tool.icon className="w-4 h-4" />
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={insertImage}
                        title="Insert Image URL Template"
                        className="h-8 w-8"
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant={showPreview ? "default" : "ghost"}
                      size="icon-sm"
                      onClick={() => setShowPreview(!showPreview)}
                      title={showPreview ? "Hide Preview" : "Show Preview"}
                      className="h-8 w-8 flex-shrink-0"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {!showPreview ? (
                    <Textarea
                      ref={contentRef}
                      id="content"
                      placeholder="Write your post content in Markdown..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={15}
                      className="font-mono border-0 focus-visible:ring-0 rounded-none resize-none"
                      required
                    />
                  ) : (
                    <div className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                      {formData.content ? (
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4 mt-6" style={{ fontFamily: 'Georgia, serif' }}>
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3 mt-5" style={{ fontFamily: 'Georgia, serif' }}>
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-xl font-bold tracking-tight text-foreground mb-3 mt-4">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-base leading-relaxed text-foreground/90 mb-4">
                                {children}
                              </p>
                            ),
                            a: ({ href, children }) => (
                              <a href={href} className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                            code: ({ children }) => (
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="overflow-x-auto bg-muted p-4 rounded my-4 border border-shadow-gray">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-shadow-gray pl-4 my-4 italic text-foreground/75">
                                {children}
                              </blockquote>
                            ),
                            ul: ({ children }) => <ul className="space-y-2 my-4 ml-6 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="space-y-2 my-4 ml-6 list-decimal">{children}</ol>,
                            li: ({ children }) => (
                              <li className="text-base leading-relaxed text-foreground/90">
                                {children}
                              </li>
                            ),
                            img: ({ src, alt }) => (
                              <img src={src} alt={alt || ''} className="rounded-lg my-4 max-w-full h-auto" />
                            ),
                          }}
                        >
                          {formData.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-muted-foreground italic">Start typing to see preview...</p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {showPreview ? "Click the eye icon to return to editing" : "Use the toolbar above or type Markdown directly"}
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? `Creating ${contentType === "recipes" ? "Recipe" : "Post"}...` : `Create ${contentType === "recipes" ? "Recipe" : "Post"}`}
                </Button>
                <Link href={`/admin/dashboard?tab=${contentType === "recipes" ? "recipes" : "content"}`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <CreatePostContent />
    </Suspense>
  )
}
