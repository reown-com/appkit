import UniversalProvider from '@walletconnect/universal-provider'

import { SolStoreUtil } from '../utils/scaffold'
import type { WalletConnectAppMetadata } from './walletConnectConnector'

const DEFAULT_LOGGER = 'error'

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class UniversalProviderFactory {
  protected static provider: UniversalProvider | undefined
  protected static relayerRegion: string | undefined
  protected static projectId: string | undefined
  protected static metadata: WalletConnectAppMetadata | undefined

  public static setSettings(params: {
    projectId: string
    relayerRegion: string
    metadata: WalletConnectAppMetadata
    qrcode: boolean
  }) {
    UniversalProviderFactory.relayerRegion = params.relayerRegion
    UniversalProviderFactory.projectId = params.projectId
    UniversalProviderFactory.metadata = params.metadata
  }

  public static async getProvider() {
    if (!UniversalProviderFactory.provider) {
      await UniversalProviderFactory.init()
    }
    if (!UniversalProviderFactory.provider) {
      throw new Error('Failed to initialize universal provider')
    }

    return UniversalProviderFactory.provider
  }

  public static async init() {
    UniversalProviderFactory.provider = await UniversalProvider.init({
      logger: DEFAULT_LOGGER,
      relayUrl: UniversalProviderFactory.relayerRegion,
      projectId: UniversalProviderFactory.projectId,
      metadata: UniversalProviderFactory.metadata
    })

    // Subscribe to session delete
    UniversalProviderFactory.provider.on('session_delete', () => {
      delete UniversalProviderFactory.provider?.session?.namespaces['solana']
      SolStoreUtil.setAddress('')
    })
  }
}
