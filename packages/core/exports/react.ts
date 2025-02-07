import { useEffect, useState } from 'react'

import { useSnapshot } from 'valtio'

import type { ChainNamespace } from '@reown/appkit-common'

import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type { UseAppKitAccountReturn, UseAppKitNetworkReturn } from '../src/utils/TypeUtil.js'

// -- Hooks ------------------------------------------------------------
export function useAppKitNetworkCore(): Pick<
  UseAppKitNetworkReturn,
  'caipNetwork' | 'chainId' | 'caipNetworkId'
> {
  const { activeCaipNetwork } = useSnapshot(ChainController.state)

  return {
    caipNetwork: activeCaipNetwork,
    chainId: activeCaipNetwork?.id,
    caipNetworkId: activeCaipNetwork?.caipNetworkId
  }
}

export function useAppKitAccount(options?: {
  chainNamespace?: ChainNamespace
}): UseAppKitAccountReturn {
  const [chain, setChain] = useState(options?.chainNamespace || ChainController.state.activeChain)
  const [chainAdapterMap, setChainAdapterMap] = useState(ChainController.state.chains)

  useEffect(() => {
    const unsubscribeActiveChain = ChainController.subscribeKey('activeChain', val => {
      setChain(options?.chainNamespace || val)
    })

    const unsubscribeChains = ChainController.subscribe(val => {
      setChainAdapterMap(val['chains'])
    })

    return () => {
      unsubscribeChains()
      unsubscribeActiveChain()
    }
  }, [])

  const authConnector = ConnectorController.getAuthConnector()
  const accountState = chain ? chainAdapterMap.get(chain)?.accountState : undefined

  console.log('>>> accountState')

  return {
    allAccounts: accountState?.allAccounts || [],
    caipAddress: accountState?.caipAddress,
    address: CoreHelperUtil.getPlainAddress(accountState?.caipAddress),
    isConnected: Boolean(accountState?.caipAddress),
    status: accountState?.status,
    embeddedWalletInfo: authConnector
      ? {
          user: accountState?.user,
          authProvider: accountState?.socialProvider || 'email',
          accountType: accountState?.preferredAccountType,
          isSmartAccountDeployed: Boolean(accountState?.smartAccountDeployed)
        }
      : undefined
  }
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
