import { Button } from '@chakra-ui/react'
import { useAppKitAccount, useAppKitProvider, type Provider } from '@reown/appkit/react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import type { TypedDataField } from 'ethers'
import { useChakraToast } from '../Toast'

const types: Record<string, TypedDataField[]> = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' }
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' }
  ]
}

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

export function EthersSignTypedDataTest() {
  const toast = useChakraToast()
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')

  async function onSignTypedData() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new BrowserProvider(walletProvider, 1)
      const signer = new JsonRpcSigner(provider, address)
      const domain = {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      } as const

      const signature = await signer?.signTypedData(domain, types, message)

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
    <Button data-testid="sign-typed-data-button" onClick={onSignTypedData}>
      Sign Typed Data
    </Button>
  )
}
