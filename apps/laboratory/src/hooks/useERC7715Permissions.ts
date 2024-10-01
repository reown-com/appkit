import { useContext } from 'react'
import { ERC7715PermissionsContext } from '../context/ERC7715PermissionsContext'

export function useERC7715Permissions() {
  const context = useContext(ERC7715PermissionsContext)

  if (context === undefined) {
    throw new Error('useERC7715Permissions must be used within a ERC7715PermissionsProvider')
  }

  const { smartSession, setSmartSession, clearSmartSession } = context

  return {
    clearSmartSession,
    smartSession,
    setSmartSession
  }
}
