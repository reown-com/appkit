import { QrCode, useWeb3ModalTheme } from '@web3modal/react'
import { useState } from 'react'

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'
import { getProjectId, getTheme } from '../utilities/EnvUtil'

// Configure wagmi and web3modal
const projectId = getProjectId()
const chains = [mainnet, polygon]
const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ version: 2, projectId, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

// Example
export default function qrcode() {
  const [uri] = useState('https://walletconnect.com')

  const theme = useWeb3ModalTheme()
  theme.setTheme({
    themeMode: 'light'
  })

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '5em' }}>
          <QrCode
            size={300}
            imageUrl="https://walletconnect.com/_next/static/media/brand_icon_blue.c5e25f1c.svg"
            uri={uri}
          />
        </div>
      </WagmiConfig>

      <Web3Modal ethereumClient={ethereumClient} projectId={projectId} themeMode={getTheme()} />
    </>
  )
}
