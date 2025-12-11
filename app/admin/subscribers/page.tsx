'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import type { Subscriber } from '@/types/subscribers'

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  async function fetchSubscribers() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/subscribers')
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
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
