import { useState } from 'react'

import { useAccount, useDisconnect, useSignMessage } from 'wagmi'

export function Account() {
  const { connector: _connector, ...account } = useAccount()
  const disconnect = useDisconnect()

  if (!account.isConnected) {
    return null
  }

  if (disconnect.isPending) {
    return <div>Disconnecting...</div>
  }

  const handleDisconnect = async () => {
    try {
      await disconnect.disconnectAsync()
    } catch (error) {
      window.alert('An error occurred. Check the console for more details.')
      console.error(error)
    }
  }

  return (
    <>
      <div className="container__account_data">{JSON.stringify(account, null, 2)}</div>
      <SignMessageButton />
      <button onClick={handleDisconnect}>Disconnect</button>
    </>
  )
}

function SignMessageButton() {
  const [isLoading, setIsLoading] = useState(false)
  const signMessage = useSignMessage()

  const handleSignMessage = async () => {
    try {
      setIsLoading(true)
      const result = await signMessage.signMessageAsync({
        message: 'Hello, World!'
      })
      window.alert(`Signature: ${result}`)
    } catch (error) {
      window.alert('An error occurred. Check the console for more details.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button onClick={handleSignMessage} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Sign Message'}
    </button>
  )
}
