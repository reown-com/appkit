import { useContext } from 'react'
import { GrantedPermissionsContext } from '../context/GrantedPermissionContext'

export function useGrantedPermissions() {
  const context = useContext(GrantedPermissionsContext)
  if (context === undefined) {
    throw new Error('useGrantedPermissions must be used within a GrantedPermissionsProvider')
  }

  return context
}
