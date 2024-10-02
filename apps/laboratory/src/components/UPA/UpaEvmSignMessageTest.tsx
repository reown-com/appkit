import * as React from 'react'
import { Button } from '@chakra-ui/react'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import Provider from '@walletconnect/universal-provider'

export function UpaEvmSignMessageTest() {
  const toast = useChakraToast()
  const { isConnected, address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      await walletProvider.request({
        method: 'eth_sign',
        params: [address, 'Hello AppKit!']
      })

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
