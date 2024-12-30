import { useAppKitAccount } from '@reown/appkit/react'

export function YourApp() {
  const { isConnected, user } = useAppKitAccount()

  return <div>{isConnected ? user.email : 'Not connected'}</div>
}
