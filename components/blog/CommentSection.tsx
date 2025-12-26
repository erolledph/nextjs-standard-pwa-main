'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, Reply } from 'lucide-react'
import type { Comment } from '@/types/comments'

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyAuthor, setReplyAuthor] = useState<string>('')

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

  function startReply(commentId: string, commentAuthor: string) {
    setReplyingTo(commentId)
    setReplyAuthor(commentAuthor)
    setFormData(prev => ({ ...prev, content: `@${commentAuthor} ` }))
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

      toast.success('Comment posted successfully!')
      setFormData({ author: '', email: '', content: '' })
      setReplyingTo(null)
      setReplyAuthor('')
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
      <section aria-label="Comments" className="mt-16 pt-12 border-t border-border">
        <p className="text-center text-muted-foreground">Loading comments...</p>
      </section>
    )
  }

  const rootComments = comments.filter((c) => !c.parentId)

  function formatDate(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d`
  }

  function getAvatarUrl(name: string, isAdmin?: boolean): string {
    if (isAdmin) return '/avatar.svg'
    const encoded = encodeURIComponent(name)
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encoded}&scale=80`
  }

  return (
    <section aria-label="Comments" className="mt-16 pt-12 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
            Comments
          </h2>
          <span className="text-base text-muted-foreground">({comments.length})</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Comment Form */}
        {!replyingTo && (
          <div className="border-b border-border pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous&scale=80"
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 space-y-3">
                  <Textarea
                    id="content"
                    placeholder="What are your thoughts?"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value.slice(0, 2000) })
                    }
                    disabled={submitting}
                    maxLength={2000}
                    rows={3}
                    className="resize-none text-[15px]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      id="author"
                      placeholder="Your name"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value.slice(0, 100) })
                      }
                      disabled={submitting}
                      maxLength={100}
                      className="h-9 text-sm"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com (private)"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={submitting}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center ml-[52px]">
                <p className="text-xs text-muted-foreground">{formData.content.length}/2000</p>
                <Button type="submit" disabled={submitting} size="sm" className="h-9 px-5">
                  Comment
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            rootComments
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  allComments={comments}
                  onReply={startReply}
                  replyingTo={replyingTo}
                  formData={formData}
                  setFormData={setFormData}
                  submitting={submitting}
                  handleSubmit={handleSubmit}
                  depth={0}
                  formatDate={formatDate}
                  getAvatarUrl={getAvatarUrl}
                />
              ))
          )}
        </div>

        {/* Reply Form - shown when replying */}
        {replyingTo && (
          <div className="border-t border-b border-border py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-sm text-foreground">
                  Reply to {replyAuthor}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyAuthor('')
                    setFormData(prev => ({ ...prev, content: '' }))
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-3">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous&scale=80"
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="What are your thoughts?"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value.slice(0, 2000) })
                    }
                    disabled={submitting}
                    maxLength={2000}
                    rows={3}
                    className="resize-none text-[15px]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Your name"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value.slice(0, 100) })
                      }
                      disabled={submitting}
                      maxLength={100}
                      className="h-9 text-sm"
                    />
                    <Input
                      type="email"
                      placeholder="your@email.com (private)"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={submitting}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center ml-[52px]">
                <p className="text-xs text-muted-foreground">{formData.content.length}/2000</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyAuthor('')
                      setFormData(prev => ({ ...prev, content: '' }))
                    }}
                    className="h-9 px-5"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} size="sm" className="h-9 px-5">
                    Reply
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}

function CommentThread({
  comment,
  allComments,
  onReply,
  replyingTo,
  formData,
  setFormData,
  submitting,
  handleSubmit,
  depth,
  formatDate,
  getAvatarUrl,
}: {
  comment: Comment
  allComments: Comment[]
  onReply: (id: string, author: string) => void
  replyingTo: string | null
  formData: { author: string; email: string; content: string }
  setFormData: (data: any) => void
  submitting: boolean
  handleSubmit: (e: React.FormEvent) => void
  depth: number
  formatDate: (date: Date) => string
  getAvatarUrl: (name: string, isAdmin?: boolean) => string
}) {
  const replies = allComments.filter((c) => c.parentId === comment.id)
  const avatarUrl = getAvatarUrl(comment.author, comment.isAdmin)

  const parseContent = (content: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = content.split(mentionRegex)
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <span key={i} className="inline-flex items-center gap-1 text-primary font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-at-sign w-3 h-3">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path>
            </svg>
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className={depth > 0 ? 'ml-12' : ''}>
      {/* Comment */}
      <div className="flex gap-3 mb-4" style={{ paddingLeft: depth > 0 ? '3rem' : '0' }}>
        <div className="flex-shrink-0 mt-0.5">
          <img
            alt={comment.author}
            className="w-10 h-10 rounded-full object-cover"
            src={avatarUrl}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-foreground hover:underline cursor-pointer">
              {comment.author}
            </p>
            {comment.isAdmin && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                Author
              </span>
            )}
            <span className="text-muted-foreground text-xs">·</span>
            <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
          </div>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90 mb-2">
            {parseContent(comment.content)}
          </p>
          <div className="flex items-center gap-1 -ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id, comment.author)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Reply className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-medium">Reply</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div>
          {replies
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                allComments={allComments}
                onReply={onReply}
                replyingTo={replyingTo}
                formData={formData}
                setFormData={setFormData}
                submitting={submitting}
                handleSubmit={handleSubmit}
                depth={depth + 1}
                formatDate={formatDate}
                getAvatarUrl={getAvatarUrl}
              />
            ))}
        </div>
      )}
    </div>
  )
}

function getAvatarUrl(name: string, isAdmin?: boolean): string {
  if (isAdmin) return '/avatar.svg'
  const encoded = encodeURIComponent(name)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encoded}&scale=80`
}
