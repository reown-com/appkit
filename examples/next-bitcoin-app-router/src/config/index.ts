import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { AppKitNetwork, bitcoin, bitcoinTestnet } from '@reown/appkit/networks'
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useDisconnect,
  useWalletInfo
} from '@reown/appkit/react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const networks = [bitcoin, bitcoinTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

export const bitcoinAdapter = new BitcoinAdapter()

// Create modal
const modal = createAppKit({
  adapters: [bitcoinAdapter],
  networks,
  metadata: {
    name: 'AppKit Next.js Bitcoin',
    description: 'AppKit Next.js App Router with Bitcoin Adapter',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  themeMode: 'light'
})

export {
  modal,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
}
