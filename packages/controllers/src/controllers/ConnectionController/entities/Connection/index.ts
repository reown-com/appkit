import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'

import type { ConnectedWalletInfo } from '../../../../utils/TypeUtil.js'
import type { Account } from '../Account/Account.js'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

export type ConnectionId = string

export type ConnectionProps = {
  /** Stable id for this session (connector + namespace + instance). */
  id: ConnectionId

  /** Connector identity */
  connectorId: string
  connectorType: 'walletConnect' | 'injected' | 'external' | 'embedded' | 'custom'

  /** Namespace this connection serves */
  namespace: ChainNamespace

  /** Accounts surfaced by the wallet */
  accounts: Account[]

  /** Active account */
  activeAccount: Account

  /** Current active chain */
  caipNetwork?: CaipNetwork

  /** Wallet info */
  wallet: ConnectedWalletInfo

  /** Lifecycle */
  status: ConnectionStatus
  lastError?: { code: string; message: string }

  /** Opaque connector session info (for reconnect) */
  session?: unknown

  /** Optional UX/auth preferences */
  preferences?: {
    preferredAccountType?: Account['type']
  }

  /** Misc metadata */
  meta?: {
    walletName?: string
    walletIconUrl?: string
    connectedAt?: number
    lastUpdatedAt?: number
    walletInfo?: unknown
  }
}

export class Connection {
  /** Stable id for this session (connector + namespace + instance). */
  public id: ConnectionId

  /** Connector identity */
  public connectorId: string
  public connectorType: 'walletConnect' | 'injected' | 'external' | 'embedded' | 'custom'

  /** Namespace this connection serves */
  public namespace: ChainNamespace

  /** Accounts surfaced by the wallet */
  public accounts: Account[]

  /** Active account */
  public activeAccount: Account

  /** Current active chain */
  public caipNetwork?: CaipNetwork

  /** Wallet info */
  public wallet: ConnectedWalletInfo

  /** Lifecycle */
  public status: ConnectionStatus
  public lastError?: { code: string; message: string }

  /** Opaque connector session info (for reconnect) */
  public session?: unknown

  /** Optional UX/auth preferences */
  public preferences?: {
    preferredAccountType?: Account['type']
  }

  /** Misc metadata */
  public meta?: {
    walletName?: string
    walletIconUrl?: string
    connectedAt?: number
    lastUpdatedAt?: number
    walletInfo?: unknown
  }

  constructor(props: ConnectionProps) {
    this.id = props.id
    this.connectorId = props.connectorId
    this.connectorType = props.connectorType
    this.namespace = props.namespace
    this.accounts = props.accounts
    this.activeAccount = props.activeAccount
    this.caipNetwork = props.caipNetwork
    this.wallet = props.wallet
    this.status = props.status
    this.lastError = props.lastError
    this.session = props.session
    this.preferences = props.preferences
    this.meta = props.meta
  }

  /**
   * Set the active account
   */
  public setActiveAccount(account: Account): void {
    if (!this.accounts.find(acc => acc.address === account.address)) {
      throw new Error('Account not found in connection accounts')
    }
    this.activeAccount = account
    this.meta = { ...this.meta, lastUpdatedAt: Date.now() }
  }

  /**
   * Get connection info for serialization
   */
  public toJSON(): ConnectionProps {
    return {
      id: this.id,
      connectorId: this.connectorId,
      connectorType: this.connectorType,
      namespace: this.namespace,
      accounts: this.accounts,
      activeAccount: this.activeAccount,
      caipNetwork: this.caipNetwork,
      wallet: this.wallet,
      status: this.status,
      lastError: this.lastError,
      session: this.session,
      preferences: this.preferences,
      meta: this.meta
    }
  }
}
