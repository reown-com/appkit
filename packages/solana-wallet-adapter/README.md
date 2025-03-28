# WalletConnect Solana Adapter

## Install

```sh
pnpm add @walletconnect/solana-adapter
```

## Create a WalletConnect project

Get a Project ID from https://cloud.walletconnect.com/

## Implementation

```tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'

export const SolanaContext = ({ children }: { children: ReactNode }) => {
	const endpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Mainnet), [WalletAdapterNetwork.Mainnet])

	const wallets = useMemo(
		() => [
			new WalletConnectWalletAdapter({
				network: WalletAdapterNetwork.Mainnet,
				options: {
					projectId: 'YOUR_PROJECT_ID',
				},
			}),
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[WalletAdapterNetwork.Mainnet],
	)

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>
					{children}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}
```