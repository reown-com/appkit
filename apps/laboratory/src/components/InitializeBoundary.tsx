import { useEffect, useState } from 'react'

import { useAppKitState } from '@reown/appkit/react'

export default function InitializeBoundary({ children }: { children: React.ReactNode }) {
  const { initialized: isInitialized } = useAppKitState()
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      const timeout = setTimeout(() => {
        setHasTimedOut(true)
      }, 20_000)

      return () => clearTimeout(timeout)
    }
  }, [isInitialized])

  // Add a loading skeleton
  if (!isInitialized) {
    return (
      <div data-testid="w3m-page-loading">
        Initializing...
        {hasTimedOut && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
            Still initializing after 20s (started: {new Date().toISOString()})
          </div>
        )}
      </div>
    )
  }

  return children
}
