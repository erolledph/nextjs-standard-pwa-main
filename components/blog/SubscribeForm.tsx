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
