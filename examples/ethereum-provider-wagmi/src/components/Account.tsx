import {
  useAccount,
  useConnections,
  useDisconnect,
  useSignMessage,
  useSignTypedData,
  useSwitchChain
} from 'wagmi'

import { chains } from '../main'

// Example data
const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' }
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' }
  ]
} as const
const message = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
  },
  contents: 'Hello, Bob!'
} as const

export function Account() {
  const { connector: _connector, ...account } = useAccount()

  if (!account.isConnected) {
    return null
  }

  return (
    <>
      <div className="container__account_data">{JSON.stringify(account, null, 2)}</div>
      <div className="container__account_actions">
        <ButtonActions />
        <SwitchNetworks />
      </div>
    </>
  )
}

function ButtonActions() {
  const { chainId } = useAccount()
  const { signMessage, isPending: isSigningMessage } = useSignMessage({
    mutation: {
      onSuccess(result) {
        window.alert(`Signature: ${result}`)
      }
    }
  })
  const { signTypedData, isPending: isSigningTypedData } = useSignTypedData({
    mutation: {
      onSuccess(result) {
        window.alert(`Signature (typed data): ${result}`)
      }
    }
  })
  const { disconnect, isPending: isDisconnecting } = useDisconnect()

  const connections = useConnections()

  const handleDisconnect = async () => {
    try {
      connections.forEach(({ connector }) => {
        console.log('connector', connector)
        disconnect({ connector })
      })
    } catch (error) {
      window.alert('An error occurred. Check the console for more details.')
      console.error(error)
    }
  }

  const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const

  return (
    <div className="container__actions">
      <h1>Example Actions</h1>

      <div className="container__actions_buttons">
        <button
          onClick={() => {
            signMessage({
              message: 'Hello, World!'
            })
          }}
          disabled={isSigningMessage}
        >
          {isSigningMessage ? 'Signing...' : 'Sign message'}
        </button>
        <button
          onClick={() => {
            signTypedData({
              domain,
              message,
              primaryType: 'Mail',
              types
            })
          }}
          disabled={isSigningTypedData}
        >
          {isSigningTypedData ? 'Signing...' : 'Sign Typed Data'}
        </button>

        <button onClick={handleDisconnect} disabled={isDisconnecting}>
          Disconnect
        </button>
      </div>
    </div>
  )
}

function SwitchNetworks() {
  const { switchChain, isPending } = useSwitchChain()

  return (
    <div className="container__switch_networks">
      <h1>Switch Networks</h1>
      <div className="container__switch_networks_buttons">
        {chains.map(chain => (
          <button onClick={() => switchChain({ chainId: chain.id })} disabled={isPending}>
            {chain.name}
          </button>
        ))}
      </div>
    </div>
  )
}
