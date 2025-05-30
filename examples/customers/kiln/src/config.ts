import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet } from '@reown/appkit/networks'
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

const env = {
  is_testnet: process.env.NODE_ENV !== 'production',
  wallet_connect_project_id: import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'
}

export const metadata = {
  name: 'Kiln',
  description: 'kiln ',
  url: 'https://kiln.fi',
  icons: ['https://dashboard.kiln.fi/favicon.ico']
}

const network = env.is_testnet ? solanaDevnet : solana
const projectId = env.wallet_connect_project_id

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new LedgerWalletAdapter()]
})

// Create modal
const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [network],
  metadata,
  projectId,
  features: {
    analytics: true
  }
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
