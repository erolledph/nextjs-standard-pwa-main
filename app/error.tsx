'use client'

import { useEffect } from 'react'
import logger from '@/lib/logger-pino'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to GitHub Issues for tracking
    logger.error('Page Render Error', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      errorName: error.name,
    })
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          We've logged this error and our team will investigate it shortly.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="w-full">
          Try Again
        </Button>
      </div>
    </div>
  )
}
