import { Button, useToast } from '@chakra-ui/react'
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi'

// Example data
const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
} as const

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
  const { signMessageAsync } = useSignMessage({ message: 'Hello Web3Modal!' })
  const { signTypedDataAsync } = useSignTypedData({
    domain,
    message,
    primaryType: 'Mail',
    types
  })

  async function onSignMessage() {
    try {
      const signature = await signMessageAsync()
      toast({ title: 'Succcess', description: signature, status: 'success', isClosable: true })
    } catch {
      toast({
        title: 'Error',
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
      toast({ title: 'Succcess', description: signature, status: 'success', isClosable: true })
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
          <Button onClick={() => onSignMessage()}>Sign Message</Button>
          <Button onClick={() => onSignTypedData()}>Sign Typed Data</Button>
        </>
      ) : null}
    </>
  )
}
