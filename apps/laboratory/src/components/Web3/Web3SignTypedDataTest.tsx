import { Button } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/web3/react'

import { Web3Eth } from 'web3-eth'

import { useChakraToast } from '../Toast'

const types = {
  EIP712Domain: [
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'version',
      type: 'string'
    },
    {
      name: 'chainId',
      type: 'uint256'
    },
    {
      name: 'verifyingContract',
      type: 'address'
    }
  ],
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
}

export function Web3SignTypedDataTest() {
  const toast = useChakraToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignTypedData() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const domain = {
        name: 'Ether Mail',
        version: '1',
        chainId: chainId ? chainId?.toString() : '1',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      } as const

      const web3Eth = new Web3Eth({
        provider: walletProvider,
        config: { defaultNetworkId: chainId }
      })
      /**
       * Alternative to the above you can use the following:
       * ```
       * import { Web3 } from 'web3'
       * ...
       * const web3 = new Web3({ provider: walletProvider, config: { defaultNetworkId: chainId } })
       * ```
       * And later in the code: you can use `web3.eth` instead of `web3Eth`.
       */

      const signature = await web3Eth.signTypedData(address, {
        primaryType: 'Mail',
        domain,
        types,
        message
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
    <Button data-testid="sign-typed-data-button" onClick={onSignTypedData}>
      Sign Typed Data
    </Button>
  )
}
