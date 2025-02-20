import { EthereumProvider } from '@walletconnect/ethereum-provider'

interface ActionButtonListProps {
  provider?: InstanceType<typeof EthereumProvider>
  session: unknown
  account?: string
  onSessionChange: (session: unknown) => void
  onBalanceChange: (balance: string | undefined) => void
  onAccountChange: (account: string | undefined) => void
  onNetworkChange: (network: string | undefined) => void
}

export default function ActionButtonList({
  provider,
  session,
  account,
  onSessionChange,
  onBalanceChange,
  onAccountChange,
  onNetworkChange
}: ActionButtonListProps) {
  if (!provider) return null

  return (
    <div className="appkit-buttons-container">
      {session ? (
        <>
          <button
            onClick={async () => {
              await provider.disconnect()
              onSessionChange(provider.session)
              onBalanceChange(undefined)
              onAccountChange(undefined)
              onNetworkChange(undefined)
            }}
          >
            Disconnect
          </button>
          <button
            onClick={async () => {
              const balance = await provider.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
              })
              onBalanceChange(balance as string)
            }}
          >
            Get Balance
          </button>
        </>
      ) : (
        <button onClick={async () => await provider.connect()}>Connect</button>
      )}
    </div>
  )
}
