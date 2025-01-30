import { type AppKitNetwork, defineChain, mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { UpaTests } from '../../components/UPA/UpaTests'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const networks = [
  ...ConstantsUtil.AllNetworks,
  defineChain({
    id: '91b171bb158e2d3848fa23a9f1c25182',
    name: 'Polkadot',
    network: 'polkadot',
    nativeCurrency: { name: 'Polkadot', symbol: 'DOT', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.polkadot.io'] }
    },
    chainNamespace: 'polkadot',
    caipNetworkId: 'polkadot:mainnet'
  })
]

const modal = createAppKit({
  networks: networks as [AppKitNetwork, ...AppKitNetwork[]],
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiAdapterOnly() {
  return (
    <>
      <button onClick={() => modal.open({ view: 'ConnectingWalletConnectBasic' })}>Open</button>
      <AppKitButtons />
      <MultiChainInfo />
      <UpaTests />
    </>
  )
}
