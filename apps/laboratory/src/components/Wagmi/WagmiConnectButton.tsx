import { Button, useToast } from '@chakra-ui/react'
import { useAccount, useNetwork, useSignMessage, useSignTypedData } from 'wagmi'
import { WagmiTransactionButton } from './WagmiTransactionButton'
import { useEffect, useState } from 'react'
import { SigningFailedToastTitle, SigningSucceededToastTitle } from '../../constants'

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

// Component
export function WagmiConnectButton() {
  const toast = useToast()
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { signMessageAsync } = useSignMessage({ message: 'Hello Web3Modal!' })
  const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: chain?.id,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const

  const { signTypedDataAsync } = useSignTypedData({
    domain,
    message,
    primaryType: 'Mail',
    types
  })
  const [connector, setConnector] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setConnector(localStorage.getItem('@w3m/connected_connector'))
    }, 0)
  }, [isConnected])

  async function onSignMessage() {
    try {
      const signature = await signMessageAsync()
      toast({
        title: SigningSucceededToastTitle,
        description: signature,
        status: 'success',
        isClosable: true
      })
    } catch {
      toast({
        title: SigningFailedToastTitle,
        description: 'Failed to sign message',
        status: 'error',
        isClosable: true
      })
    }
  }

  async function onSignTypedData() {
    try {
      const signature = await signTypedDataAsync({
        domain,
        message,
        primaryType: 'Mail',
        types
      })
      toast({ title: 'Success', description: signature, status: 'success', isClosable: true })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sign message',
        status: 'error',
        isClosable: true
      })
    }
  }

  return (
    <>
      <w3m-button />
      {isConnected ? (
        <>
          <Button data-testid="sign-message-button" onClick={onSignMessage}>
            Sign Message
          </Button>
          <Button data-testid="sign-typed-data-button" onClick={onSignTypedData}>
            Sign Typed Data
          </Button>
          {connector === 'EMAIL' ? <WagmiTransactionButton /> : null}
        </>
      ) : null}
    </>
  )
}
