import UniversalProvider from '@walletconnect/universal-provider'

interface ActionButtonListProps {
  provider?: UniversalProvider
  session: unknown
  account?: string
  onSessionChange: (session: unknown) => void
  onAccountChange: (account: string | undefined) => void
  onBalanceChange: (balance: string | undefined) => void
  onNetworkChange: (network: string | undefined) => void
}

export default function ActionButtonList({
  provider,
  session,
  account,
  onSessionChange,
  onAccountChange,
  onBalanceChange,
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
              const requestArguments = {
                method: 'eth_getBalance',
                params: [account, 'latest']
              }
              const balance = await provider.request(requestArguments, 'eip155:1')
              onBalanceChange(balance as string)
            }}
          >
            Get Balance
          </button>
        </>
      ) : (
        <button
          onClick={async () =>
            await provider.connect({
              optionalNamespaces: {
                eip155: {
                  methods: [
                    'eth_sendTransaction',
                    'eth_signTransaction',
                    'eth_sign',
                    'personal_sign',
                    'eth_signTypedData'
                  ],
                  chains: ['eip155:1'],
                  events: ['chainChanged', 'accountsChanged']
                }
              }
            })
          }
        >
          Connect
        </button>
      )}
    </div>
  )
}
