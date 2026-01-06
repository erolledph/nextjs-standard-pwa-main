'use client'

import { useState } from 'react'
import { submitToIndexNow } from '@/lib/indexnow'
import { toast } from 'sonner'

export default function TestIndexNow() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [testUrl, setTestUrl] = useState('')

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const url = testUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/blog/test-${Date.now()}`
      console.log('Testing IndexNow with URL:', url)
      
      const response = await submitToIndexNow([url])
      console.log('Response:', response)
      
      setResult(response)
      
      if (response.success) {
        toast.success('✅ IndexNow submission successful!')
      } else {
        toast.error(`❌ ${response.message}`)
      }
    } catch (err: any) {
      console.error('Error:', err)
      setResult({
        success: false,
        message: err.message || 'Unknown error'
      })
      toast.error(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 IndexNow Submission Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Environment Info</h2>
            <dl className="space-y-1 text-sm text-blue-800 font-mono">
              <div className="flex justify-between">
                <dt>NEXT_PUBLIC_SITE_URL:</dt>
                <dd className="font-bold">{process.env.NEXT_PUBLIC_SITE_URL || '❌ NOT SET'}</dd>
              </div>
            </dl>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Test URL (optional - defaults to test blog URL)
            </label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://worldfoodrecipes.sbs/blog/my-test-post"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition"
          >
            {loading ? '⏳ Testing...' : '📡 Submit to IndexNow'}
          </button>

          {/* Results */}
          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Success' : '❌ Failed'}
              </h3>
              <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </p>
              {result.fullResponse && (
                <pre className="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(result.fullResponse, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Console Output */}
          <div className="bg-gray-900 text-gray-100 p-4 rounded text-xs font-mono space-y-1">
            <p className="text-yellow-400">💡 Check browser console (F12) for detailed logs</p>
            <p className="text-gray-500">Open DevTools → Console tab to see all debug messages</p>
          </div>
        </div>
      </div>
    </div>
  )
}
