import { Button } from '@chakra-ui/react'
import { useAccount, useSignTypedData } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

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
  const toast = useChakraToast()
  const { isConnected } = useAppKitAccount()
  const { chain } = useAccount()
  const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: chain?.id,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const

  const { signTypedDataAsync, isPending } = useSignTypedData()

  async function onSignTypedData() {
    try {
      const signature = await signTypedDataAsync({
        domain,
        message,
        primaryType: 'Mail',
        types
      })
      toast({
        title: 'Success',
        description: signature,
        type: 'success'
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sign message',
        type: 'error'
      })
    }
  }

  return (
    <Button
      data-testid="sign-typed-data-button"
      onClick={onSignTypedData}
      isDisabled={!isConnected || isPending}
      isLoading={isPending}
    >
      Sign Typed Data
    </Button>
  )
}
