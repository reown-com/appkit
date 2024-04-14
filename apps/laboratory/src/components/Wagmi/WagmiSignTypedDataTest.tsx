import { Button } from '@chakra-ui/react'
import { toast } from 'sonner'
import { useAccount, useSignTypedData } from 'wagmi'

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

export function WagmiSignTypedDataTest() {
  const { chain, status } = useAccount()
  const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: chain?.id,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const
  const isConnected = status === 'connected'

  const { signTypedDataAsync } = useSignTypedData()

  async function onSignTypedData() {
    try {
      const signature = await signTypedDataAsync({
        domain,
        message,
        primaryType: 'Mail',
        types
      })
      toast.success('Success', { description: signature })
    } catch {
      toast.error('Error', {
        description: 'Failed to sign message'
      })
    }
  }

  return (
    <Button
      data-testid="sign-typed-data-button"
      onClick={onSignTypedData}
      isDisabled={!isConnected}
    >
      Sign Typed Data
    </Button>
  )
}
