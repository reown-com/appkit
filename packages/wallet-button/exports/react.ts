/* eslint-disable consistent-return */
import { useSnapshot } from 'valtio'
import { useCallback, useEffect, useState } from 'react'
import { ConstantsUtil } from '../src/utils/ConstantsUtil.js'
import type { Wallet } from './index.js'
import { ConnectorUtil } from '../src/utils/ConnectorUtil.js'
import { ConnectorController, type Connector } from '@reown/appkit-core'
import { WalletUtil } from '../src/utils/WalletUtil.js'
import type { SocialProvider } from '../src/utils/TypeUtil.js'
import type { ParsedCaipAddress } from '@reown/appkit-common'
import { ApiController } from '../src/controllers/ApiController.js'

interface UseAppKitWalletParameters {
  onSuccess?: (datat: ParsedCaipAddress) => void
  onError?: (error: Error) => void
}

export function useAppKitWallet(parameters?: UseAppKitWalletParameters) {
  const { connectors } = useSnapshot(ConnectorController.state)

  const { onSuccess, onError } = parameters ?? {}

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<ParsedCaipAddress>()

  const handleSuccess = useCallback(
    (caipAddress: ParsedCaipAddress) => {
      setData(caipAddress)
      onSuccess?.(caipAddress)
    },
    [onSuccess]
  )

  const handleError = useCallback(
    (err: unknown) => {
      const finalError = err instanceof Error ? err : new Error('Something went wrong')
      setError(finalError)
      onError?.(finalError)
    },
    [onError]
  )

  const connect = useCallback(
    async (wallet: Wallet) => {
      try {
        setIsLoading(true)

        await ApiController.fetchWalletButtons()

        const walletButton = WalletUtil.getWalletButton(wallet as string)

        const connector = walletButton
          ? ConnectorController.getConnector(walletButton.id, walletButton.rdns)
          : undefined

        if (ConstantsUtil.Socials.some(social => social === wallet)) {
          const socialData = await ConnectorUtil.connectSocial(wallet as SocialProvider)
          handleSuccess(socialData)

          return
        }

        if (connector) {
          const externalData = await ConnectorUtil.connectExternal(connector)
          handleSuccess(externalData)

          return
        }

        const walletConnectData = await ConnectorUtil.connectWalletConnect({
          walletConnect: wallet === 'walletConnect',
          connector: connectors.find(c => c.id === 'walletConnect') as Connector | undefined,
          wallet: walletButton
        })
        handleSuccess(walletConnectData)
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [connectors, handleSuccess, handleError]
  )

  return { data, error, isLoading, isError: Boolean(error), isSuccess: Boolean(data), connect }
}
