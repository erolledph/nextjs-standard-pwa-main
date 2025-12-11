'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Check, Trash2, Reply, X } from 'lucide-react'
import type { Comment } from '@/types/comments'

interface CommentsTabProps {
  adminEmail?: string
}

export function CommentsTab({ adminEmail }: CommentsTabProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')

  useEffect(() => {
    fetchComments()
  }, [])

  async function fetchComments() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/comments')
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

  async function handleApprove(commentId: string) {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to approve comment')
      toast.success('Comment approved')
      fetchComments()
    } catch (error) {
      console.error('Error approving comment:', error)
      toast.error('Failed to approve comment')
    }
  }

  async function handleReject(commentId: string) {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to reject comment')
      toast.success('Comment rejected')
      fetchComments()
    } catch (error) {
      console.error('Error rejecting comment:', error)
      toast.error('Failed to reject comment')
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to delete comment')
      toast.success('Comment deleted')
      fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  async function handleSubmitReply(commentId: string) {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    setSubmittingReply(true)
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          postSlug: comments.find(c => c.id === commentId)?.postSlug,
        }),
      })
      if (!response.ok) throw new Error('Failed to post reply')
      toast.success('Reply posted successfully')
      setReplyingTo(null)
      setReplyContent('')
      fetchComments()
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setSubmittingReply(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>Loading comments...</p>
      </div>
    )
  }

  const pendingComments = comments.filter((c) => !c.approved && !c.parentId)
  const approvedComments = comments.filter((c) => c.approved && !c.parentId)
  const displayedComments = activeTab === 'pending' ? pendingComments : approvedComments

  function formatDate(date: Date | string): string {
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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border gap-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-primary text-foreground -mb-1'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending ({pendingComments.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'approved'
              ? 'border-b-2 border-primary text-foreground -mb-1'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Approved ({approvedComments.length})
        </button>
      </div>

      {/* Comments List */}
      {displayedComments.length > 0 ? (
        <div className="space-y-6">
          {displayedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              allComments={comments}
              onApprove={activeTab === 'pending' ? handleApprove : undefined}
              onReject={activeTab === 'pending' ? handleReject : undefined}
              onDelete={handleDelete}
              onReply={() => setReplyingTo(comment.id)}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={() => handleSubmitReply(comment.id)}
              submittingReply={submittingReply}
              formatDate={formatDate}
              getAvatarUrl={getAvatarUrl}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {activeTab === 'pending' ? 'No pending comments' : 'No approved comments'}
          </p>
        </div>
      )}
    </div>
  )
}

function CommentCard({
  comment,
  allComments,
  onApprove,
  onReject,
  onDelete,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  submittingReply,
  formatDate,
  getAvatarUrl,
}: {
  comment: Comment
  allComments: Comment[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onDelete: (id: string) => void
  onReply: () => void
  replyingTo: string | null
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: () => void
  submittingReply: boolean
  formatDate: (date: Date | string) => string
  getAvatarUrl: (name: string, isAdmin?: boolean) => string
}) {
  const replies = allComments.filter((c) => c.parentId === comment.id)
  const avatarUrl = getAvatarUrl(comment.author, comment.isAdmin)

  function parseContent(content: string) {
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
    <div>
      {/* Comment */}
      <div className="flex gap-3 mb-4">
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
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90 mb-3">
            {parseContent(comment.content)}
          </p>

          {!comment.approved && (
            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 mb-3">
              Pending approval
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 -ml-2 flex-wrap">
            {!comment.approved && onApprove && (
              <Button
                size="sm"
                onClick={() => onApprove(comment.id)}
                className="h-8 px-3 text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Approve
              </Button>
            )}
            {!comment.approved && onReject && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(comment.id)}
                className="h-8 px-3 text-xs font-medium"
              >
                Reject
              </Button>
            )}
            {comment.approved && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReply}
                  className="h-8 px-3 text-xs font-medium"
                >
                  <Reply className="w-3.5 h-3.5 mr-1" />
                  Reply
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(comment.id)}
              className="h-8 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Reply Form - shown when replying */}
      {replyingTo === comment.id && (
        <div className="ml-12 mt-4 p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm text-foreground">Reply to {comment.author}</p>
            <button
              onClick={() => setReplyContent('')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={submittingReply}
              rows={3}
              className="resize-none text-[15px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyContent('')}
                className="h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSubmitReply}
                disabled={submittingReply || !replyContent.trim()}
                className="h-9 px-4"
              >
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((reply) => (
              <div key={reply.id} style={{ paddingLeft: '3rem' }}>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <img
                      alt={reply.author}
                      className="w-9 h-9 rounded-full object-cover"
                      src={getAvatarUrl(reply.author, reply.isAdmin)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-foreground">
                        {reply.author}
                      </p>
                      {reply.isAdmin && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          Author
                        </span>
                      )}
                      <span className="text-muted-foreground text-xs">·</span>
                      <p className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</p>
                    </div>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90 mb-2">
                      {parseContent(reply.content)}
                    </p>
                    <div className="flex items-center gap-2 -ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(reply.id)}
                        className="h-8 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
