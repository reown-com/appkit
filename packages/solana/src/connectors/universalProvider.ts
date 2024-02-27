import UniversalProvider from '@walletconnect/universal-provider'
import { SolStoreUtil } from '@web3modal/scaffold-utils/solana'

import type { WalletConnectAppMetadata } from './WalletConnectConnector'

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
      metadata: UniversalProviderFactory.metadata,
    })

    // Subscribe to session ping
    /*
     *UniversalProviderFactory.provider.on(
     *'session_ping',
     *({ id, topic }: { id: number, topic: string }) => {
     *  console.log(id, topic)
     *}
     *)
     *
     * // Subscribe to session event
     *UniversalProviderFactory.provider.on(
     *'session_event',
     *({ event, chainId }: { event: unknown, chainId: string }) => {
     *  console.log(event, chainId)
     *}
     *)
     *
     * // Subscribe to session update
     *UniversalProviderFactory.provider.on(
     *'session_update',
     *({ topic, params }: { topic: string, params: unknown }) => {
     *  console.log(topic, params)
     *}
     *)
     *
     */

    // Subscribe to session delete
    UniversalProviderFactory.provider.on('session_delete', () => {
      delete UniversalProviderFactory.provider?.session?.namespaces['solana']
      SolStoreUtil.setAddress('')
    })
  }
}
