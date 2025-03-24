/* eslint-disable consistent-return */
import { useCallback, useEffect, useState } from 'react'

import { useSnapshot } from 'valtio'

import type { ParsedCaipAddress } from '@reown/appkit-common'
import { ChainController, type Connector, ConnectorController } from '@reown/appkit-controllers'

import { ApiController } from '../src/controllers/ApiController.js'
import { WalletButtonController } from '../src/controllers/WalletButtonController.js'
import { ConnectorUtil } from '../src/utils/ConnectorUtil.js'
import { ConstantsUtil } from '../src/utils/ConstantsUtil.js'
import type { SocialProvider } from '../src/utils/TypeUtil.js'
import { WalletUtil } from '../src/utils/WalletUtil.js'
import type { AppKitWalletButton, Wallet } from './index.js'

export * from './index.js'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-wallet-button': Pick<AppKitWalletButton, 'wallet'>
    }
  }
}

export function useAppKitWallet(parameters?: {
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

  const { onSuccess, onError } = parameters ?? {}

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
          await ConnectorUtil.connectEmail().then(handleSuccess)

          return
        }

        if (ConstantsUtil.Socials.some(social => social === wallet)) {
          await ConnectorUtil.connectSocial(wallet as SocialProvider).then(handleSuccess)

          return
        }

        const walletButton = WalletUtil.getWalletButton(wallet)

        const connector = walletButton
          ? ConnectorController.getConnector(walletButton.id, walletButton.rdns)
          : undefined

        if (connector) {
          await ConnectorUtil.connectExternal(connector).then(handleSuccess)

          return
        }

        await ConnectorUtil.connectWalletConnect({
          walletConnect: wallet === 'walletConnect',
          connector: connectors.find(c => c.id === 'walletConnect') as Connector | undefined,
          wallet: walletButton
        }).then(handleSuccess)
      } catch (err) {
        handleError(err)
      } finally {
        WalletButtonController.setPending(false)
      }
    },
    [connectors, handleSuccess, handleError]
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

    await ConnectorUtil.updateEmail()
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
