'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { MessageCircle, Send, MessageSquare } from 'lucide-react'
import type { Comment } from '@/types/comments'

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    author: '',
    email: '',
    content: '',
  })

  useEffect(() => {
    fetchComments()
  }, [postSlug])

  async function fetchComments() {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?postSlug=${postSlug}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.author.trim() || !formData.email.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.content.length > 2000) {
      toast.error('Comment is too long (max 2000 characters)')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postSlug,
          author: formData.author,
          email: formData.email,
          content: formData.content,
          parentId: replyingTo || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to post comment')
      }

      toast.success('Comment posted! Awaiting approval.')
      setFormData({ author: '', email: '', content: '' })
      setReplyingTo(null)
      fetchComments()
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading comments...</p>
        </CardContent>
      </Card>
    )
  }

  const rootComments = comments.filter((c) => !c.parentId)
  const repliesByParent = comments.reduce(
    (acc, comment) => {
      if (comment.parentId) {
        if (!acc[comment.parentId]) acc[comment.parentId] = []
        acc[comment.parentId].push(comment)
      }
      return acc
    },
    {} as Record<string, Comment[]>
  )

  function formatDate(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  function getAvatarUrl(name: string, isAdmin?: boolean): string {
    if (isAdmin) return '/avatar.svg'
    const encoded = encodeURIComponent(name)
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encoded}&scale=80`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 border-b pb-8">
          <h3 className="font-semibold">Leave a Comment</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Your name"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value.slice(0, 100) })
              }
              disabled={submitting}
            />
            <Input
              type="email"
              placeholder="Your email (private)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={submitting}
            />
          </div>

          <Textarea
            placeholder="Your comment..."
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value.slice(0, 2000) })
            }
            disabled={submitting}
            rows={4}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formData.content.length}/2000
            </span>
            {replyingTo && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel reply
              </button>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {rootComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <CommentCard
                  comment={comment}
                  isReply={false}
                  onReply={() => setReplyingTo(comment.id)}
                  formatDate={formatDate}
                  getAvatarUrl={getAvatarUrl}
                />

                {/* Replies */}
                {repliesByParent[comment.id] && (
                  <div className="ml-8 space-y-4 border-l-2 border-border pl-4">
                    {repliesByParent[comment.id].map((reply) => (
                      <CommentCard
                        key={reply.id}
                        comment={reply}
                        isReply={true}
                        onReply={() => setReplyingTo(reply.id)}
                        formatDate={formatDate}
                        getAvatarUrl={getAvatarUrl}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CommentCard({
  comment,
  isReply,
  onReply,
  formatDate,
  getAvatarUrl,
}: {
  comment: Comment
  isReply: boolean
  onReply: () => void
  formatDate: (date: Date) => string
  getAvatarUrl: (name: string, isAdmin?: boolean) => string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {comment.author[0]?.toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.author}</span>
            {comment.isAdmin && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                Author
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>

          <p className="mt-2 text-sm text-foreground">{comment.content}</p>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="mt-2 text-xs"
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  )
}
