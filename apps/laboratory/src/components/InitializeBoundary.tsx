import { useAppKitState } from '@reown/appkit/react'

export default function InitializeBoundary({ children }: { children: React.ReactNode }) {
  const { initialized } = useAppKitState()

  // Add a loading skeleton
  if (!initialized) {
    return <div data-testid="w3m-page-loading">Initializing...</div>
  }

  return children
}
