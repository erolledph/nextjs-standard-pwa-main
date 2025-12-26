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
      <Card className="border shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 rounded-full bg-emerald-500 p-4 shadow-lg">
            <Check className="h-7 w-7 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">Thank You for Subscribing!</h3>
          <p className="text-center text-sm text-muted-foreground max-w-sm">
            You're all set. Check your email for exciting updates and exclusive content.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl">Subscribe to Our Newsletter</CardTitle>
        <CardDescription className="text-base">
          Get the latest recipes, cooking tips, and exclusive content delivered straight to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div className="relative">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="pr-12"
            />
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
            >
              {loading ? '...' : '→'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground px-1">
            ✓ We respect your privacy. Unsubscribe anytime. No spam, ever.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
