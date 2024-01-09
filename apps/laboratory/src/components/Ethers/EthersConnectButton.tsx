import { Button, useToast } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { EthersTransactionButton } from './EthersTransactionButton'
import type { TypedDataField } from 'ethers'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

// Example data
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

// Component
export function EthersConnectButton() {
  const toast = useToast()
  const { isConnected, address, chainId } = useWeb3ModalAccount()
  const { walletProvider, walletProviderType } = useWeb3ModalProvider()

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, address)
      const signature = await signer?.signMessage('Hello Web3Modal Ethers')

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        status: 'success',
        isClosable: true
      })
    } catch {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
        status: 'error',
        isClosable: true
      })
    }
  }

  async function onSignTypedData() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, address)
      const domain = {
        name: 'Ether Mail',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      } as const

      const signature = await signer?.signTypedData(domain, types, message)

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
          <Button data-testid="sign-message-button" onClick={onSignMessage}>
            Sign Message
          </Button>
          <Button data-testid="sign-typed-data-button" onClick={onSignTypedData}>
            Sign Typed Data
          </Button>
          {walletProviderType === 'w3mEmail' ? <EthersTransactionButton /> : null}
        </>
      ) : null}
    </>
  )
}
