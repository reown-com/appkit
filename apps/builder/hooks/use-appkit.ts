import { AppKitContext } from '@/contexts/appkit-context'
import { useContext } from 'react'

export const useAppKit = () => {
  const context = useContext(AppKitContext)
  if (!context) {
    throw new Error('useAppKit must be used within an AppKitProvider')
  }
  return context
}
