import * as React from 'react'
import { Button } from '@chakra-ui/react'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import Provider from '@walletconnect/universal-provider'
import base58 from 'bs58'

export function UpaSolanaSignMessageTest() {
  const toast = useChakraToast()
  const { isConnected, address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { caipNetwork } = useAppKitNetwork()

  async function onSignMessage() {
    try {
      console.log('> Lab - Wallet PRovider', walletProvider)
      console.log('> Lab . Address', address)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      const payload = {
        method: 'solana_signMessage',
        params: {
          message: base58.encode(new TextEncoder().encode('Hello Appkit!')),
          pubkey: address
        }
      }
      const chain = caipNetwork?.id
      await walletProvider.request(payload, chain)

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: 'Success',
        type: 'success'
      })
    } catch (error) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
        type: 'error'
      })
    }
  }

  return (
    <>
      <Button
        disabled={!isConnected}
        data-testid="sign-message-button"
        onClick={onSignMessage}
        width="auto"
      >
        Sign Message
      </Button>
      <div data-testid="w3m-signature" hidden></div>
    </>
  )
}
