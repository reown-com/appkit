/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable consistent-return */
import React, { useCallback, useEffect, useState } from 'react'

import { createComponent } from '@lit/react'
import { useSnapshot } from 'valtio'

import type { ChainNamespace, ParsedCaipAddress } from '@reown/appkit-common'
import {
  ChainController,
  type Connector,
  ConnectorController,
  ConnectorControllerUtil,
  ModalController,
  RouterController
} from '@reown/appkit-controllers'

import { ApiController } from '../src/controllers/ApiController.js'
import { WalletButtonController } from '../src/controllers/WalletButtonController.js'
import { ConstantsUtil } from '../src/utils/ConstantsUtil.js'
import type { SocialProvider } from '../src/utils/TypeUtil.js'
import { WalletUtil } from '../src/utils/WalletUtil.js'
import { AppKitWalletButton as AppKitWalletButtonComponent, type Wallet } from './index.js'

export * from './index.js'

export const AppKitWalletButton = createComponent({
  tagName: 'appkit-wallet-button',
  elementClass: AppKitWalletButtonComponent,
  react: React
})

interface AppKitElements {
  'appkit-wallet-button': Pick<AppKitWalletButtonComponent, 'wallet' | 'namespace'>
}
/* ------------------------------------------------------------------ */
/* Declare global namespace for React 18     */
/* ------------------------------------------------------------------ */
declare global {
  namespace JSX {
    interface IntrinsicElements extends AppKitElements {}
  }
}
/* ------------------------------------------------------------------ */
/* Helper alias with the built‑ins that React already supplied     */
/* ------------------------------------------------------------------ */
type __BuiltinIntrinsics = JSX.IntrinsicElements

/* ------------------------------------------------------------------ */
/* Declare react namespace for React 19 and extend with JSX built-ins (div, button, etc.) and extend with AppKitElements */
/* ------------------------------------------------------------------ */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends __BuiltinIntrinsics, AppKitElements {}
  }
}
export function useAppKitWallet(parameters?: {
  namespace?: ChainNamespace
  onSuccess?: (data: ParsedCaipAddress) => void
  onError?: (error: Error) => void
}) {
  const { connectors } = useSnapshot(ConnectorController.state)
  const {
    pending: isWalletButtonConnecting,
    ready: isWalletButtonReady,
    error: walletButtonError,
    data: walletButtonData
  } = useSnapshot(WalletButtonController.state)

  const { namespace, onSuccess, onError } = parameters ?? {}

  // Prefetch wallet buttons
  useEffect(() => {
    if (!isWalletButtonReady) {
      ApiController.fetchWalletButtons().then(() => {
        if (ApiController.state.walletButtons.length) {
          WalletButtonController.setReady(true)
        }
      })
    }
  }, [isWalletButtonReady])

  useEffect(
    () =>
      ChainController.subscribeKey('activeCaipAddress', val => {
        if (val) {
          WalletButtonController.setError(undefined)
          WalletButtonController.setPending(false)
        }
      }),
    []
  )

  useEffect(
    () =>
      ApiController.subscribeKey('walletButtons', val => {
        if (val.length) {
          WalletButtonController.setReady(true)
        }
      }),
    []
  )

  const handleSuccess = useCallback(
    (caipAddress: ParsedCaipAddress) => {
      WalletButtonController.setData(caipAddress)
      onSuccess?.(caipAddress)
    },
    [onSuccess]
  )

  const handleError = useCallback(
    (err: unknown) => {
      const finalError = err instanceof Error ? err : new Error('Something went wrong')
      WalletButtonController.setError(finalError)
      onError?.(finalError)
    },
    [onError]
  )

  const connect = useCallback(
    async (wallet: Wallet) => {
      try {
        WalletButtonController.setPending(true)
        WalletButtonController.setError(undefined)

        if (wallet === ConstantsUtil.Email) {
          await ConnectorControllerUtil.connectEmail({
            namespace,
            onOpen() {
              ModalController.open({ view: 'EmailLogin' })
            }
          }).then(handleSuccess)

          return
        }

        if (ConstantsUtil.Socials.some(social => social === wallet)) {
          await ConnectorControllerUtil.connectSocial({
            social: wallet as SocialProvider,
            namespace,
            onOpenFarcaster() {
              ModalController.open({ view: 'ConnectingFarcaster' })
            },
            onConnect() {
              RouterController.push('Connect')
            }
          }).then(handleSuccess)

          return
        }

        const walletButton = WalletUtil.getWalletButton(wallet)

        const connector = walletButton
          ? ConnectorController.getConnector({
              id: walletButton.id,
              rdns: walletButton.rdns,
              namespace
            })
          : undefined

        if (connector) {
          await ConnectorControllerUtil.connectExternal(connector).then(handleSuccess)

          return
        }

        await ConnectorControllerUtil.connectWalletConnect({
          walletConnect: wallet === 'walletConnect',
          connector: connectors.find(c => c.id === 'walletConnect') as Connector | undefined,
          onOpen(isMobile) {
            ModalController.open({
              view: isMobile ? 'AllWallets' : 'ConnectingWalletConnect',
              data: isMobile ? undefined : { wallet: walletButton }
            })
          },
          onConnect() {
            RouterController.replace('Connect')
          }
        }).then(handleSuccess)
      } catch (err) {
        handleError(err)
      } finally {
        WalletButtonController.setPending(false)
      }
    },
    [namespace, connectors, handleSuccess, handleError]
  )

  return {
    data: walletButtonData,
    error: walletButtonError,
    isReady: isWalletButtonReady,
    isPending: isWalletButtonConnecting,
    isError: Boolean(walletButtonError),
    isSuccess: Boolean(walletButtonData),
    connect
  }
}

export function useAppKitUpdateEmail(parameters?: {
  onSuccess?: (data: { email: string }) => void
  onError?: (error: Error) => void
}) {
  const { onSuccess, onError } = parameters ?? {}

  const [data, setData] = useState<{ email: string }>()
  const [error, setError] = useState<Error>()
  const [isPending, setIsPending] = useState(false)

  const updateEmail = useCallback(async () => {
    setIsPending(true)
    setError(undefined)

    await ConnectorControllerUtil.updateEmail()
      .then(emailData => {
        setData(emailData)
        onSuccess?.(emailData)
      })
      .catch(err => {
        setError(err)
        onError?.(err)
      })
      .finally(() => setIsPending(false))
  }, [onError, onSuccess])

  return {
    data,
    error,
    isPending,
    isError: Boolean(error),
    isSuccess: Boolean(data),
    updateEmail
  }
}
