import {
  createAppKit,
  useAppKitAccount,
  useAppKitProvider,
  type CaipNetwork
} from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

import { AppKitButtons } from '../../components/AppKitButtons'

import { BitcoinAdapter, type BitcoinProvider } from '@reown/appkit-adapter-bitcoin'
import { useToast } from '@chakra-ui/react'

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
  const { walletProvider, walletProviderType } = useAppKitProvider<BitcoinProvider>('bip122')
  const { address } = useAppKitAccount()
  console.log('>> WALLET PROVIDER', walletProvider, walletProviderType)
  const toast = useToast()
  async function signMessage() {
    if (!walletProvider) {
      toast({
        title: 'No wallet provider',
        status: 'error',
        isClosable: true
      })
    }

    const signature = await (walletProvider as any).signMessage({
      address,
      message: 'Hello, World!'
    })

    console.log('>> SIGNATURE', signature)
  }

  return (
    <>
      <AppKitButtons />
      <button onClick={signMessage}>Connect</button>
    </>
  )
}
