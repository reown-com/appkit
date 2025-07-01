import { Core } from '@walletconnect/core'
import {
  type BuildApprovedNamespacesParams,
  buildApprovedNamespaces,
  getSdkError
} from '@walletconnect/utils'

import { WalletKit, type WalletKitTypes } from '@reown/walletkit'

import { PROJECT_ID } from '../constants/index.js'

// -- Constants ----------------------------------------------------------------
const DEFAULT_METADATA = {
  name: 'Reown',
  description: 'Reown',
  url: 'https://reown.com',
  icons: []
}

// -- Types --------------------------------------------------------------------
interface WalletKitOptions {
  projectId: string
  metadata: {
    name: string
    description: string
    url: string
    icons: string[]
  }
}

type ApproveSessionsParams = Pick<WalletKitTypes.SessionProposal, 'id' | 'params'> & {
  namespaces: BuildApprovedNamespacesParams['supportedNamespaces']
}

interface ListenEventsParams {
  onSessionProposal?: (event: WalletKitTypes.SessionProposal) => void
  onSessionRequest?: (event: WalletKitTypes.SessionRequest) => void
  onSessionDelete?: (event: WalletKitTypes.SessionDelete) => void
}

export class WalletKitManager {
  private core: InstanceType<typeof Core>
  private walletKit: Awaited<ReturnType<typeof WalletKit.init>> | null = null
  private options: WalletKitOptions

  constructor({
    projectId = PROJECT_ID,
    metadata = DEFAULT_METADATA
  }: Partial<WalletKitOptions> = {}) {
    this.options = {
      projectId,
      metadata
    }
    this.core = new Core({ projectId, customStoragePrefix: `w3m_test_${Math.random()}` })
  }

  public async init() {
    if (this.walletKit) {
      return this.walletKit
    }

    this.walletKit = await WalletKit.init({
      core: this.core,
      metadata: this.options.metadata
    })

    return this.walletKit
  }

  public getWalletKit() {
    if (!this.walletKit) {
      throw new Error('WalletKit has not been initialized. Call `init()` first.')
    }

    return this.walletKit
  }

  public async approveSession({ id, params, namespaces }: ApproveSessionsParams) {
    try {
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: namespaces
      })

      const walletKit = this.getWalletKit()

      await walletKit.approveSession({
        id,
        namespaces: approvedNamespaces
      })
    } catch (error) {
      const walletKit = this.getWalletKit()

      // eslint-disable-next-line no-console
      console.error(`Failed to approve session: ${error}`)

      await walletKit.rejectSession({
        id,
        reason: getSdkError('USER_REJECTED')
      })
    }
  }

  public async pair(uri: string) {
    const walletKit = this.getWalletKit()

    await walletKit.pair({ uri })
  }

  public listenEvents({
    onSessionProposal,
    onSessionRequest,
    onSessionDelete
  }: ListenEventsParams) {
    const walletKit = this.getWalletKit()

    if (onSessionProposal) {
      walletKit.on('session_proposal', onSessionProposal)
    }
    if (onSessionRequest) {
      walletKit.on('session_request', onSessionRequest)
    }
    if (onSessionDelete) {
      walletKit.on('session_delete', onSessionDelete)
    }
  }
}
