import { OptionsController } from '@reown/appkit-core'
import { useEffect, useState } from 'react'

import type {
  SIWEClientMethods,
  SIWEConfig,
  SIWECreateMessageArgs,
  SIWESession,
  SIWEVerifyMessageArgs
} from '../core/utils/TypeUtils.js'
import { AppKitSIWEClient } from '../src/client.js'
import { SIWEController } from '../core/controller/SIWEController.js'
export {
  getAddressFromMessage,
  getChainIdFromMessage,
  verifySignature
} from '../core/helpers/index.js'
export * from '../core/utils/AppKitAuthUtil.js'

export { formatMessage, getDidAddress, getDidChainId } from '@walletconnect/utils'
export { SIWEController, type SIWEControllerClient } from '../core/controller/SIWEController.js'
export * from '../core/utils/TypeUtils.js'
export type {
  AppKitSIWEClient,
  SIWEClientMethods,
  SIWEConfig,
  SIWECreateMessageArgs,
  SIWESession,
  SIWEVerifyMessageArgs
}

export * from '../scaffold/partials/w3m-connecting-siwe/index.js'
export * from '../scaffold/views/w3m-connecting-siwe-view/index.js'

export function createSIWEConfig(siweConfig: SIWEConfig) {
  return new AppKitSIWEClient(siweConfig)
}

// -- Hooks ------------------------------------------------------------

export function useSiweSession() {
  if (
    SIWEController.state.status !== 'uninitialized' &&
    !SIWEController.state._client &&
    !OptionsController.state.enableAuth
  ) {
    throw new Error(
      'Please provide a "siweConfig" or enable AppKit Auth before using "useSiweSession" hook'
    )
  }
  const [session, setSession] = useState(SIWEController.state.session)
  const [status, setStatus] = useState(SIWEController.state.status)

  useEffect(() => {
    const unsubscribe = SIWEController.subscribeKey('session', newSession => {
      if (!newSession?.address || !newSession?.chainId) {
        setSession(undefined)
      }
      setSession(newSession)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    const unsubscribe = SIWEController.subscribeKey('status', newStatus => {
      setStatus(newStatus)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  return {
    session,
    status,
    getRemoteSession: SIWEController.getSession
  }
}
