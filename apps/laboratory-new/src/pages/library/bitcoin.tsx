import {
  createAppKit,
  useAppKitAccount,
  useAppKitProvider,
  type CaipNetwork
} from '@reown/appkit-new/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

import { AppKitButtons } from '../../components/AppKitButtons'

import { BitcoinAdapter, type BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { Button, Stack, useToast } from '@chakra-ui/react'
import { useState } from 'react'

const networks = ConstantsUtil.BitcoinNetworks

const bitcoinAdapter = new BitcoinAdapter({
  networks: networks as CaipNetwork[],
  projectId: ConstantsUtil.ProjectId
})

const appkit = createAppKit({
  adapters: [bitcoinAdapter],
  networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  metadata: ConstantsUtil.Metadata,
  debug: true
})

ThemeStore.setModal(appkit)

export default function MultiChainBitcoinAdapterOnly() {
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)

  const toast = useToast()
  async function signMessage() {
    if (!walletProvider || !address) {
      toast({
        title: 'No connection detected',
        status: 'error',
        isClosable: true
      })

      return
    }

    setLoading(true)

    try {
      const signature = await walletProvider.signMessage({
        address,
        message: 'Hello, World!'
      })
      toast({ title: 'Signature', description: signature, status: 'success' })
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function sendTransfer() {
    if (!walletProvider) {
      toast({
        title: 'No wallet provider',
        status: 'error',
        isClosable: true
      })
    }

    try {
      const signature = await walletProvider.sendTransfer({
        recipient: 'bc1qcer94ntpu33lcj0fnave79lu8tghkll47eeu9u',
        amount: '100000'
      })

      toast({
        title: `Transfer sent: ${signature}`,
        status: 'success',
        isClosable: true
      })
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppKitButtons />
      {address && (
        <Stack direction={['column', 'column', 'row']} pt="8">
          <Button data-testid="sign-transaction-button" onClick={signMessage} isDisabled={loading}>
            Sign Message
          </Button>
          <Button data-testid="send-transfer-button" onClick={sendTransfer} isDisabled={loading}>
            Send Transfer
          </Button>
        </Stack>
      )}
    </>
  )
}
