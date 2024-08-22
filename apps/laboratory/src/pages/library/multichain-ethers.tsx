import { createWeb3Modal } from '@web3modal/base/react'
import { EVMEthersClient, defaultConfig } from '@web3modal/base/adapters/evm/ethers'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { mainnet, arbitrum, optimism } from '../../utils/NetworksUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { MultiChainTests } from '../../components/MultiChainTests'
import { MultiChainInfo } from '../../components/MultiChainInfo'

const etherAdapter = new EVMEthersClient({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata
  })
})

const modal = createWeb3Modal({
  adapters: [etherAdapter],
  projectId: ConstantsUtil.ProjectId,
  caipNetworks: [mainnet, arbitrum, optimism],
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function MultiChainAllAdapters() {
  return (
    <>
      <AppKitButtons />
      <MultiChainInfo />
      <MultiChainTests />
    </>
  )
}
