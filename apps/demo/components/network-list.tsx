'use client'

import { useAppKitAccount } from '@reown/appkit-controllers/react'

import { ExclamationMarkIcon } from '@/components/icon/exclamation-mark'
import { AlertDescription } from '@/components/ui/alert'
import { Alert } from '@/components/ui/alert'
import { useAppKitContext } from '@/hooks/use-appkit'
import { NETWORK_OPTIONS, type NetworkOption } from '@/lib/networks'
import { getImageDeliveryURL, networkImages } from '@/lib/presets'

import { RoundOptionItem } from './ui/round-option-item'

export function NetworkList() {
  const { caipAddress } = useAppKitAccount()
  const {
    enabledChains,
    enabledNetworks,
    removeNetwork,
    addNetwork,
    getEnabledNetworksInNamespace
  } = useAppKitContext()

  function getIsLastNetworkInNamespace(network: NetworkOption) {
    const enabledNetworksInNamespace = getEnabledNetworksInNamespace(network.namespace)

    return (
      enabledNetworksInNamespace.length === 1 &&
      enabledNetworksInNamespace.includes(network.network.id)
    )
  }

  const isLastChain = enabledChains.length === 1

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        {NETWORK_OPTIONS.map(n => {
          const isLastNetworkInNamespace = getIsLastNetworkInNamespace(n)
          const isLastChainEnabled = isLastNetworkInNamespace && isLastChain

          return (
            <RoundOptionItem
              message={
                isLastChainEnabled ? 'Have at least one chain enabled to disable network' : ''
              }
              size="sm"
              dataTestId={`network-option-${n.network.id}`}
              key={n.network.id}
              enabled={enabledNetworks.includes(n.network.id)}
              disabled={Boolean(caipAddress) || isLastChainEnabled}
              imageSrc={getImageDeliveryURL(
                networkImages[n.network.id as keyof typeof networkImages]
              )}
              onChange={() => {
                if (enabledNetworks.includes(n.network.id)) {
                  removeNetwork(n)
                } else {
                  addNetwork(n)
                }
              }}
              name={n.network.name}
            />
          )
        })}
      </div>
      {caipAddress ? (
        <Alert>
          <div className="flex items-center gap-3">
            <ExclamationMarkIcon />
            <AlertDescription>
              You can only customize networks when your wallet is disconnected.
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <Alert>
          <div className="flex items-center gap-3">
            <ExclamationMarkIcon />
            <AlertDescription>
              A subset of available networks is currently being used in this integration.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}
