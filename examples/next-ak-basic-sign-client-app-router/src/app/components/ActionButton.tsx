import SignClient from '@walletconnect/sign-client'
import type { SessionTypes } from '@walletconnect/types'

import { initializeModal } from '../config'

interface ActionButtonListProps {
  signClient?: InstanceType<typeof SignClient>
  session: SessionTypes.Struct | undefined
  account?: string
  onSessionChange: (session: SessionTypes.Struct | undefined) => void
  onAccountChange: (account: string | undefined) => void
  onNetworkChange: (network: string | undefined) => void
}

export default function ActionButtonList({
  signClient,
  session,
  account,
  onSessionChange,
  onAccountChange,
  onNetworkChange
}: ActionButtonListProps) {
  if (!signClient) return null

  return (
    <div className="appkit-buttons-container">
      {session ? (
        <>
          <button
            onClick={async () => {
              await signClient.disconnect({
                topic: session.topic,
                reason: {
                  code: 1000,
                  message: 'User disconnected'
                }
              })
              onSessionChange(undefined)
              onAccountChange(undefined)
              onNetworkChange(undefined)
            }}
          >
            Disconnect
          </button>
          <button
            onClick={async () => {
              await signClient.request({
                topic: session.topic,
                chainId: 'eip155:1',
                request: {
                  method: 'personal_sign',
                  params: [
                    '0x7468697320697320612074657374206d65737361676520746f206265207369676e6564',
                    account
                  ]
                }
              })
            }}
          >
            Sign Message
          </button>
        </>
      ) : (
        <button
          onClick={async () => {
            const { uri, approval } = await signClient.connect({
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

            if (uri) {
              const appKitModal = initializeModal()
              appKitModal?.open({ uri })
              const session = await approval()
              onAccountChange(session?.namespaces['eip155']?.accounts?.[0]?.split(':')[2])
              onNetworkChange(session?.namespaces['eip155']?.chains?.[0])
              onSessionChange(session)
              appKitModal?.close()
            }
          }}
        >
          Connect
        </button>
      )}
    </div>
  )
}
