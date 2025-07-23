'use client'

import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation'

import ErrorScreen from '@/components/error-screen'
import ExchangeActions from '@/components/exchange-actions'

function ExchangeContent() {
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId')
  if (!sessionId) {
    return <ErrorScreen />
  }

  return <ExchangeActions sessionId={sessionId} />
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p>Loading...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <Suspense fallback={<LoadingFallback />}>
        <ExchangeContent />
      </Suspense>
    </div>
  )
}
