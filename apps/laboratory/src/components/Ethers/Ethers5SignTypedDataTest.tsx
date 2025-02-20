import { Button } from '@chakra-ui/react'
import { ethers } from 'ethers5'
import type { TypedDataField } from 'ethers5'

import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

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

export function Ethers5SignTypedDataTest() {
  const toast = useChakraToast()

  const { address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')

  async function onSignTypedData() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new ethers.providers.Web3Provider(walletProvider, chainId)
      const signer = provider.getSigner(address)
      const domain = {
        name: 'Ether Mail',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      } as const

      const signature = await signer?._signTypedData(domain, types, message)

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
