"use client"

import { useState, useRef, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, Link2, List, ListOrdered, Heading1, Heading2, Code, Quote, Eye, EyeOff, Image } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { toast } from "sonner"

export const runtime = 'edge'

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingPost, setFetchingPost] = useState(true)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    excerpt: "",
    tags: "",
    image: "",
    content: "",
  })

  useEffect(() => {
    fetchPost()
  }, [slug])

  async function fetchPost() {
    try {
      const response = await fetch(`/api/posts/${slug}`)
      if (!response.ok) throw new Error("Failed to fetch post")
      const post = await response.json()

      setFormData({
        title: post.title || "",
        author: post.author || "",
        excerpt: post.excerpt || "",
        tags: post.tags ? post.tags.join(", ") : "",
        image: post.image || "",
        content: post.content || "",
      })
    } catch (err) {
      console.error("Error fetching post:", err)
      toast.error("Failed to load post")
      setError("Failed to load post")
    } finally {
      setFetchingPost(false)
    }
  }

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

      const response = await fetch("/api/posts/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: formData.title,
          author: formData.author,
          excerpt: formData.excerpt,
          tags: tagsArray,
          image: formData.image,
          content: formData.content,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update post")
      }

      toast.success("Post updated successfully")
      router.push("/admin/dashboard?tab=content")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post")
      toast.error(err instanceof Error ? err.message : "Failed to update post")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingPost) {
    return (
      <main className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="container mx-auto xl:px-5 max-w-screen-lg">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error && !formData.title) {
    return (
      <main className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="container mx-auto xl:px-5 max-w-screen-lg">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Link href="/admin/dashboard?tab=content">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="container mx-auto xl:px-5 max-w-screen-lg">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Edit Post</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Update your blog post</p>
          </div>
          <Link href="/admin/dashboard?tab=content" className="flex-shrink-0">
            <Button variant="outline" size="sm" className="sm:h-9 w-full sm:w-auto">Cancel</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Blog Post</CardTitle>
            <CardDescription>Update the details of your post</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Post title"
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
                  placeholder="Brief summary of the post"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                />
              </div>

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
                  {loading ? "Updating..." : "Update Post"}
                </Button>
                <Link href="/admin/dashboard?tab=content" className="flex-1">
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
