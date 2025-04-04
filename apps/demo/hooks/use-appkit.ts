import { useContext } from 'react'

import { AppKitContext } from '@/contexts/appkit-context'

export const useAppKitContext = () => {
  const context = useContext(AppKitContext)

  if (!context) {
    throw new Error('useAppKit must be used within an AppKitProvider')
  }

  return context
}
