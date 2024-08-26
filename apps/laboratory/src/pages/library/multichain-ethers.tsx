import { createWeb3Modal } from '@web3modal/base/react'
import { EVMEthersClient } from '@web3modal/base/adapters/evm/ethers'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { mainnet, arbitrum, optimism } from '../../utils/NetworksUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { MultiChainTests } from '../../components/MultiChainTests'
import { MultiChainInfo } from '../../components/MultiChainInfo'

const modal = createWeb3Modal({
  adapters: [new EVMEthersClient()],
  projectId: ConstantsUtil.ProjectId,
  caipNetworks: [mainnet, arbitrum, optimism],
  metadata: ConstantsUtil.Metadata
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
