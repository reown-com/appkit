import { useAccount, useDisconnect } from 'wagmi'

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
    await disconnect.disconnectAsync()
  }

  return (
    <>
      <div className="container__account_data">{JSON.stringify(account, null, 2)}</div>
      <button onClick={handleDisconnect}>Disconnect</button>
    </>
  )
}
