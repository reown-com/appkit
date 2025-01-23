'use client'

import { ConstantsUtil } from '@reown/appkit-common'
import { useAppKitAccount } from '@reown/appkit-core/react'

import { ExclamationMarkIcon } from '@/components/icon/exclamation-mark'
import { AlertDescription } from '@/components/ui/alert'
import { Alert } from '@/components/ui/alert'
import { useAppKitContext } from '@/hooks/use-appkit'
import { NETWORK_ID_NAMESPACE_MAP, NETWORK_OPTIONS } from '@/lib/constants'
import { getImageDeliveryURL, networkImages } from '@/lib/presets'

import { RoundOptionItem } from './ui/round-option-item'

export function NetworkList() {
  const { caipAddress } = useAppKitAccount()
  const { enabledChains, enabledNetworks, removeNetwork, addNetwork } = useAppKitContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        {NETWORK_OPTIONS.map(n => {
          const isLastNetworkInNamespace =
            enabledNetworks.filter(
              id =>
                NETWORK_ID_NAMESPACE_MAP[id as keyof typeof NETWORK_ID_NAMESPACE_MAP] ===
                n.namespace
            ).length === 1 && enabledNetworks.includes(n.network.id)

          return (
            <RoundOptionItem
              message={
                isLastNetworkInNamespace
                  ? `Have at least one network enabled on ${
                      ConstantsUtil.CHAIN_NAME_MAP[n.namespace]
                    }`
                  : ''
              }
              size="sm"
              key={n.network.id}
              enabled={enabledNetworks.includes(n.network.id)}
              disabled={
                Boolean(caipAddress) ||
                (enabledNetworks.includes(n.network.id) && enabledNetworks.length === 1) ||
                !enabledChains.includes(n.namespace) ||
                isLastNetworkInNamespace
              }
              imageSrc={getImageDeliveryURL(
                networkImages[n.network.id as keyof typeof networkImages]
              )}
              onChange={() => {
                if (enabledNetworks.includes(n.network.id)) {
                  if (enabledNetworks.length > 1) {
                    removeNetwork(n)
                  }
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
