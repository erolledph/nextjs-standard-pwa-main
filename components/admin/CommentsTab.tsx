"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Check, Trash2, MessageSquare } from 'lucide-react'
import type { Comment } from '@/types/comments'

export function CommentsTab() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAllComments()
  }, [])

  async function fetchAllComments() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/comments')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch comments')
      }
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  async function approveComment(id: string) {
    try {
      const response = await fetch(`/api/admin/comments/${id}/approve`, {
        method: 'PATCH',
      })
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!response.ok) throw new Error('Failed to approve')
      toast.success('Comment approved')
      fetchAllComments()
    } catch (error) {
      console.error('Error approving comment:', error)
      toast.error('Failed to approve comment')
    }
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment and all replies?')) return

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      })
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Comment deleted')
      fetchAllComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const pendingComments = comments.filter((c) => !c.approved)
  const approvedComments = comments.filter((c) => c.approved)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground mt-3">Loading comments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Pending Comments */}
      <section>
        <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            Pending Approval
            <span className="text-sm font-normal text-muted-foreground">({pendingComments.length})</span>
        </h2>
        {pendingComments.length === 0 ? (
          <Card>
             <CardContent className="py-8 text-center text-muted-foreground">
                No pending comments
             </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingComments.map((comment) => (
              <AdminCommentCard
                key={comment.id}
                comment={comment}
                onApprove={() => approveComment(comment.id)}
                onDelete={() => deleteComment(comment.id)}
                isPending={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* Approved Comments */}
      <section>
        <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            Approved
            <span className="text-sm font-normal text-muted-foreground">({approvedComments.length})</span>
        </h2>
        {approvedComments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
                No approved comments
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {approvedComments.map((comment) => (
              <AdminCommentCard
                key={comment.id}
                comment={comment}
                onDelete={() => deleteComment(comment.id)}
                isPending={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function AdminCommentCard({
  comment,
  onApprove,
  onDelete,
  isPending,
}: {
  comment: Comment
  onApprove?: () => void
  onDelete: () => void
  isPending: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{comment.author}</CardTitle>
            <p className="text-sm text-muted-foreground">{comment.email}</p>
            <p className="text-xs text-muted-foreground">Post: {comment.postSlug}</p>
          </div>
          <div className="flex items-center gap-2">
            {comment.isAdmin && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                Admin
                </span>
            )}
            <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>

        <div className="flex gap-2">
          {isPending && onApprove && (
            <Button onClick={onApprove} variant="default" size="sm" className="gap-2">
              <Check className="h-4 w-4" />
              Approve
            </Button>
          )}
          <Button onClick={onDelete} variant="destructive" size="sm" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
