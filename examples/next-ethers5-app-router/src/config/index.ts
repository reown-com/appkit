import {
  createAppKit,
  useAppKit,
  useAppKitState,
  useAppKitAccount,
  useAppKitTheme,
  useAppKitEvents,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
} from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, polygon, arbitrum, optimism, AppKitNetwork } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const networks = [mainnet, polygon, arbitrum, optimism] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

export const ethersAdapter = new EthersAdapter()

export {
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
}
