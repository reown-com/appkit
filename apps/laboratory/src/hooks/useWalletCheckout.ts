/* eslint-disable no-shadow */
/* eslint-disable no-console */
import * as React from 'react'
import { useCallback, useEffect } from 'react'

import UniversalProvider from '@walletconnect/universal-provider'

import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import type { CheckoutRequest } from '../types/wallet_checkout'

export function useWalletCheckout() {
  const { address, status } = useAppKitAccount()
  const { walletProvider, walletProviderType } = useAppKitProvider<UniversalProvider>('eip155')
  const [isWalletCheckoutSupported, setIsWalletCheckoutSupported] = React.useState(false)

  const isMethodSupported = useCallback(
    async ({
      provider,
      method,
      walletProviderType
    }: {
      provider: UniversalProvider
      method: string
      walletProviderType: string
    }): Promise<{ isSupported: boolean }> => {
      if (walletProviderType === 'WALLET_CONNECT') {
        const isSupported = Boolean(provider.namespaces?.['eip155']?.methods?.includes(method))

        return Promise.resolve({ isSupported })
      }

      return { isSupported: false }
    },
    []
  )

  useEffect(() => {
    if (address && status === 'connected' && walletProvider && walletProviderType) {
      isMethodSupported({
        provider: walletProvider,
        method: 'wallet_checkout',
        walletProviderType
      }).then(({ isSupported }) => {
        setIsWalletCheckoutSupported(isSupported)
      })
    }
  }, [address, status, walletProvider, walletProviderType, isMethodSupported])

  const sendWalletCheckout = useCallback(
    async (walletCheckoutParam: CheckoutRequest) =>
      await walletProvider.request({
        method: 'wallet_checkout',
        params: [walletCheckoutParam]
      }),
    [walletProvider]
  )

  return {
    isWalletCheckoutSupported,
    sendWalletCheckout
  }
}
