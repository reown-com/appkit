import { useAppKitState } from '@reown/appkit/react'

export default function InitializeBoundary({ children }: { children: React.ReactNode }) {
  const { initialized: isInitialized } = useAppKitState()

  // Add a loading skeleton
  if (!isInitialized) {
    return <div data-testid="w3m-page-loading">Initializing...</div>
  }

  return children
}
