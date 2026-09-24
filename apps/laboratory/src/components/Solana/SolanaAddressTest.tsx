import { Button } from '@chakra-ui/react'

import type { Provider } from '@reown/appkit-adapter-solana'
import { useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function SolanaAddressTest() {
  const toast = useChakraToast()
  const { walletProvider } = useAppKitProvider<Provider>('solana')

  function onReadAddress() {
    if (!walletProvider?.publicKey) {
      toast({
        title: 'Error',
        description: 'user is disconnected',
        type: 'error'
      })

      return
    }

    toast({
      title: 'Address',
      description: `legacy PublicKey: ${walletProvider.publicKey.toBase58()} | solana-kit Address: ${walletProvider.address ?? 'n/a'}`,
      type: 'success'
    })
  }

  return (
    <Button data-testid="read-address-button" onClick={onReadAddress}>
      Read Address
    </Button>
  )
}
