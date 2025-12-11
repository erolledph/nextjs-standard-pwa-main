'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import type { Subscriber } from '@/types/subscribers'

export function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  async function fetchSubscribers() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/subscribers', {
        credentials: 'include',
      })
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
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground mt-3">Loading subscribers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Subscribers
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({subscribers.length})
            </span>
          </h2>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {subscribers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No subscribers yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Subscribed</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Blog Post</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b hover:bg-muted/20 transition-colors">
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
  )
}
