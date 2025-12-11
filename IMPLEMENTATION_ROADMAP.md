# 🗺️ IMPLEMENTATION ROADMAP
## Comment System & Subscriber Form Integration Plan

**Project:** nextjs-standard-pwa-main  
**Integration Type:** Additive (Zero Breaking Changes)  
**Timeline:** 6-8 hours  
**Complexity:** Low-Medium

---

## 📍 PHASE 1: PREPARATION & SETUP (30 mins)

### 1.1 Verify Current State
```bash
npm run build              # Verify current build succeeds
npm run dev               # Verify dev server works
```

**Expected Result:** ✅ Build passes, zero errors

### 1.2 Create Type Definitions

**File:** `types/comments.ts`
```typescript
export interface Comment {
  id: string
  postSlug: string
  author: string
  email: string
  content: string
  createdAt: Date
  approved: boolean
  isAdmin?: boolean
  parentId?: string
  mentionedUser?: string
}

export interface CommentCreatePayload {
  postSlug: string
  author: string
  email: string
  content: string
  parentId?: string
}
```

**File:** `types/subscribers.ts`
```typescript
export interface Subscriber {
  id: string
  email: string
  subscribedAt: Date
  source?: string
  verified?: boolean
  unsubscribed?: boolean
  postSlug?: string
}

export interface SubscriberCreatePayload {
  email: string
  source?: string
  postSlug?: string
}
```

### 1.3 Update Firestore Rules

**File:** `firestore.rules` - Add to existing rules:

```firestore
// SUBSCRIBERS Collection
match /subscribers/{subscriberId} {
  allow create: if request.resource.data.email is string
    && request.resource.data.email.size() > 0
    && request.resource.data.email.size() <= 254;
  allow get, list: if false;  // Admin only - we'll handle via API
  allow update, delete: if false;
}

// COMMENTS Collection
match /comments/{commentId} {
  allow get: if resource.data.approved == true;
  allow list: if resource.data.approved == true;
  allow create: if request.resource.data.postSlug is string
    && request.resource.data.author is string
    && request.resource.data.author.size() > 0
    && request.resource.data.author.size() <= 100
    && request.resource.data.content is string
    && request.resource.data.content.size() > 0
    && request.resource.data.content.size() <= 2000;
  allow update, delete: if false;
}
```

**Deployment:**
```bash
firebase deploy --only firestore:rules
```

---

## 📍 PHASE 2: COMPONENT CREATION (2 hours)

### 2.1 Create Subscriber Form Component

**File:** `components/blog/SubscribeForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

interface SubscribeFormProps {
  postSlug?: string
}

export function SubscribeForm({ postSlug }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email) && email.length <= 254
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), postSlug }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          toast.info('You are already subscribed')
        } else {
          toast.error(data.error || 'Failed to subscribe')
        }
        return
      }

      setSuccess(true)
      setEmail('')
      toast.success('Successfully subscribed!')

      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Subscribe error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 rounded-full bg-primary p-3">
            <Check className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">Thank You!</h3>
          <p className="text-center text-sm text-muted-foreground">
            You are now subscribed to our newsletter.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribe to Our Newsletter</CardTitle>
        <CardDescription>
          Get the latest recipes and cooking tips delivered to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
          <p className="text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 2.2 Create Comment Section Component

**File:** `components/blog/CommentSection.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MessageCircle, Send } from 'lucide-react'
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
        <Avatar className="h-10 w-10">
          <AvatarImage src={getAvatarUrl(comment.author, comment.isAdmin)} />
          <AvatarFallback>{comment.author[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.author}</span>
            {comment.isAdmin && <Badge variant="default">Author</Badge>}
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
```

---

## 📍 PHASE 3: API ROUTES CREATION (2 hours)

### 3.1 Comments GET Endpoint

**File:** `app/api/comments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')

    if (!postSlug) {
      return NextResponse.json(
        { error: 'postSlug parameter is required' },
        { status: 400 }
      )
    }

    const commentsRef = collection(db, 'comments')
    const q = query(
      commentsRef,
      where('postSlug', '==', postSlug),
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }))

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    // Fallback: return empty array on error
    return NextResponse.json([])
  }
}
```

### 3.2 Comments CREATE Endpoint

**File:** `app/api/comments/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { checkRateLimit } from '@/lib/rateLimiter'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown'

    const rateLimit = checkRateLimit(ip, {
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // 1 hour block
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      )
    }

    const { postSlug, author, email, content, parentId } = await request.json()

    // Validation
    if (!postSlug || typeof postSlug !== 'string') {
      return NextResponse.json(
        { error: 'postSlug is required' },
        { status: 400 }
      )
    }

    if (!author || typeof author !== 'string' || author.length > 100) {
      return NextResponse.json(
        { error: 'author must be a string (max 100 chars)' },
        { status: 400 }
      )
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'valid email is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.length > 2000) {
      return NextResponse.json(
        { error: 'content must be a string (max 2000 chars)' },
        { status: 400 }
      )
    }

    // Create comment
    const commentsRef = collection(db, 'comments')
    const docRef = await addDoc(commentsRef, {
      postSlug,
      author,
      email,
      content,
      createdAt: serverTimestamp(),
      approved: false, // Comments need approval
      ...(parentId && { parentId }),
    })

    return NextResponse.json(
      {
        message: 'Comment submitted for approval',
        commentId: docRef.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 254
}
```

### 3.3 Subscribe Endpoint

**File:** `app/api/subscribe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { checkRateLimit } from '@/lib/rateLimiter'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 subscriptions per hour per IP
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown'

    const rateLimit = checkRateLimit(ip, {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // 1 hour block
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, source, postSlug } = await request.json()

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'invalid email format' },
        { status: 400 }
      )
    }

    if (email.length > 254) {
      return NextResponse.json(
        { error: 'email is too long' },
        { status: 400 }
      )
    }

    // Check for duplicates
    const subscribersRef = collection(db, 'subscribers')
    const q = query(subscribersRef, where('email', '==', email.toLowerCase()))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: 'You are already subscribed' },
        { status: 409 }
      )
    }

    // Create subscriber
    const docRef = await addDoc(subscribersRef, {
      email: email.toLowerCase(),
      subscribedAt: serverTimestamp(),
      source: source || 'website',
      verified: false,
      unsubscribed: false,
      ...(postSlug && { postSlug }),
    })

    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
        subscriberId: docRef.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
```

---

## 📍 PHASE 4: ADMIN PAGES CREATION (1.5 hours)

### 4.1 Admin Comments Page

**File:** `app/admin/comments/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, X, Trash2, Reply } from 'lucide-react'
import type { Comment } from '@/types/comments'

export default function AdminCommentsPage() {
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

  async function approveComment(id: string) {
    try {
      const response = await fetch(`/api/admin/comments/${id}/approve`, {
        method: 'PATCH',
      })
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
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-muted-foreground">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comments</h1>
          <p className="text-muted-foreground">Moderate and manage user comments</p>
        </div>

        {/* Pending Comments */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Pending Approval ({pendingComments.length})</h2>
          {pendingComments.length === 0 ? (
            <p className="text-muted-foreground">No pending comments</p>
          ) : (
            <div className="space-y-4">
              {pendingComments.map((comment) => (
                <CommentCard
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
          <h2 className="mb-4 text-2xl font-bold">Approved ({approvedComments.length})</h2>
          {approvedComments.length === 0 ? (
            <p className="text-muted-foreground">No approved comments</p>
          ) : (
            <div className="space-y-4">
              {approvedComments.map((comment) => (
                <CommentCard
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
    </div>
  )
}

function CommentCard({
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
          {comment.isAdmin && <Badge variant="default">Admin</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground">{comment.content}</p>

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
```

### 4.2 Admin Subscribers Page

**File:** `app/admin/subscribers/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import type { Subscriber } from '@/types/subscribers'

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  async function fetchSubscribers() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/subscribers')
      if (!response.ok) throw new Error('Failed to fetch subscribers')
      const data = await response.json()
      setSubscribers(data)
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      toast.error('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV() {
    const headers = ['Email', 'Subscribed At', 'Blog Post', 'Source']
    const rows = subscribers.map((s) => [
      s.email,
      new Date(s.subscribedAt).toISOString(),
      s.postSlug || 'N/A',
      s.source || 'website',
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('Exported subscribers to CSV')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscribers</h1>
            <p className="text-muted-foreground">
              {subscribers.length} total subscriber{subscribers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {subscribers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No subscribers yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="px-4 py-2 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Subscribed
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Blog Post</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{subscriber.email}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {subscriber.postSlug ? (
                            <a
                              href={`/blog/${subscriber.postSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {subscriber.postSlug}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {subscriber.source || 'website'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 📍 PHASE 5: INTEGRATION (1 hour)

### 5.1 Update Middleware

**File:** `middleware.ts` - Update protected routes:

```typescript
const protectedRoutes = [
  "/admin/dashboard",
  "/admin/create",
  "/admin/comments",  // ← ADD THIS
  "/admin/subscribers" // ← ADD THIS
]
```

### 5.2 Add Components to Blog Post Pages

**File:** `app/blog/[slug]/page.tsx` - Update to include:

```typescript
import { CommentSection } from '@/components/blog/CommentSection'
import { SubscribeForm } from '@/components/blog/SubscribeForm'

// In the component, add near the end:
<section className="mt-12 space-y-8">
  <SubscribeForm postSlug={slug} />
  <CommentSection postSlug={slug} />
</section>
```

### 5.3 Update Admin Dashboard Navigation

Add links to new admin pages in the dashboard or tab navigation.

---

## 📍 PHASE 6: TESTING & DEPLOYMENT (1 hour)

### 6.1 Local Testing

```bash
# Install dependencies (none new needed)
npm install

# Run local dev
npm run dev

# Test in browser:
# - Subscribe to newsletter
# - Post a comment
# - Check admin dashboard
# - Check Firebase Firestore collections
```

### 6.2 Build Verification

```bash
npm run build

# Expected: ✅ Build succeeds with zero errors
```

### 6.3 Firestore Rules Test

```bash
firebase emulators:start

# Test in emulator:
# - Verify subscribers collection creates documents
# - Verify comments collection creates documents
# - Verify read restrictions work
```

### 6.4 Deployment

```bash
git add .
git commit -m "feat: add comment system and subscriber form"
npm run deploy   # or git push to main for auto-deploy
```

---

## ✅ VERIFICATION CHECKLIST

**Before marking complete:**

- [ ] npm run build passes (0 errors)
- [ ] Dev server runs (npm run dev)
- [ ] Can subscribe in browser (shows success)
- [ ] Can post comment in browser (shows pending approval)
- [ ] Admin comments page loads
- [ ] Admin subscribers page loads
- [ ] Can approve comment from admin
- [ ] Can download subscribers CSV
- [ ] Firestore shows new documents
- [ ] No console errors in browser
- [ ] TypeScript strict mode: 0 errors
- [ ] Build time <60 seconds

---

## 📊 IMPLEMENTATION TIMELINE

| Phase | Duration | Tasks |
|-------|----------|-------|
| 1. Prep & Setup | 30 mins | Types, Firestore rules |
| 2. Components | 2 hours | CommentSection, SubscribeForm |
| 3. API Routes | 2 hours | Subscribe, comments endpoints |
| 4. Admin Pages | 1.5 hours | Comment/Subscriber management |
| 5. Integration | 1 hour | Connect components, update nav |
| 6. Testing | 1 hour | Local test, build, deploy |
| **TOTAL** | **7.5 hours** | **Complete system** |

---

## 🚀 POST-DEPLOYMENT

### Monitor
- Check Firestore for documents
- Monitor error logs in Cloudflare Pages
- Review admin dashboard for new data

### Enhancements (Future)
- Email notifications for new comments
- Email verification for subscribers
- Unsubscribe endpoint
- Comment notifications
- Spam filtering/moderation
- Rich text comments

---

**Ready to begin implementation!** 🎯
