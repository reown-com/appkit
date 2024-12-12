import { AppKit, createAppKit, type CaipNetwork } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { mainnet } from '@reown/appkit/networks'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { UpaTests } from '../../components/UPA/UpaTests'
import Provider, { UniversalProvider } from '@walletconnect/universal-provider'
import { useEffect, useState } from 'react'

const networks = ConstantsUtil.EvmNetworks
let started = false
let uprovider: Provider | null = null
let appkit: AppKit | null = null
let uri = ''

export default function MultiChainWagmiAdapterOnly() {
  const [init, setInit] = useState(false)
  useEffect(() => {
    if (started) {
      return
    }

    console.log('networks', networks)
    started = true
    UniversalProvider.init({
      projectId: ConstantsUtil.ProjectId
    }).then(provider => {
      uprovider = provider
      const parsedNetworks = networks.map(n => ({
        id: n.id,
        name: n.name,
        caipNetworkId: `eip155:${n.id}`
      })) as [CaipNetwork, ...CaipNetwork[]]
      console.log('parsedNetworks', parsedNetworks)

      const modal = createAppKit({
        networks,
        defaultNetwork: mainnet,
        projectId: ConstantsUtil.ProjectId,
        metadata: ConstantsUtil.Metadata,
        manualControl: true,
        walletConnectProvider: provider
      })
      appkit = modal
      ThemeStore.setModal(modal)

      provider.on('display_uri', connection => {
        console.log('display_uri', connection)
        uri = connection
        modal.open({ view: 'ConnectingWalletConnectBasic', uri: connection })
      })
      setInit(true)
    })
  }, [])

  async function connect() {
    if (uprovider) {
      await uprovider.connect({
        optionalNamespaces: {
          eip155: {
            chains: ['eip155:1'],
            methods: ['personal_sign'],
            events: ['chainChanged']
          }
        }
      })
      appkit?.close()
    }
  }

  function open() {
    appkit?.open({ uri, view: 'ConnectingWalletConnectBasic' })
  }

  return (
    <>
      {init ? (
        <>
          <AppKitButtons />
          <button onClick={connect}>Connect</button>
          <button onClick={open}>Open Hook</button>
          <MultiChainInfo />
          <UpaTests />
        </>
      ) : (
        ''
      )}
    </>
  )
}
