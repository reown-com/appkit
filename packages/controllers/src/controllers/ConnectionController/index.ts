import type { ChainNamespace } from '@reown/appkit-common'

import type { Connector, WcWallet } from '../../utils/TypeUtil.js'
import { ConnectorController } from '../ConnectorController.js'
import { Connection } from './entities/Connection/index.js'

// -- Types --------------------------------------------- //

export type ConnectionStatus =
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'

export type ConnectionControllerState = {
  isSwitchingConnection: boolean
  connections: Map<ChainNamespace, Connection[]>
  recentConnections: Map<ChainNamespace, Connection[]>
  walletConnectManager: WalletConnectConnectionManager
  recentWallet?: WcWallet
  status?: ConnectionStatus
}

export type WalletConnectConnectionManager = {
  connectWalletConnect: (params?: ConnectWalletConnectParameters) => Promise<void>
  resetWcConnection: () => void
  resetUri: () => void
  finalizeWcConnection: () => void
  setWcBasic: (value: boolean) => void
  setUri: (value: string) => void
  setWcLinking: (value: { href: string; name: string }) => void
  setWcError: (value: boolean) => void
  setRecentWallet: (wallet?: WcWallet) => void
  setBuffering: (value: boolean) => void
  setStatus: (status?: ConnectionStatus) => void
}

export type ConnectWalletConnectParameters = {
  cache?: 'auto' | 'always' | 'never'
}

export type DisconnectParameters = {
  id?: string
  chainNamespace?: ChainNamespace
  initialDisconnect?: boolean
}

export type SwitchConnectionParameters = {
  connectionId: string
  namespace: ChainNamespace
  address?: string
}

export type ConnectionControllerClient = {
  connect: (params: ConnectParameters) => Promise<void>
  disconnect: (params?: DisconnectParameters) => Promise<void>
  reconnect: (params: ReconnectParameters) => Promise<void>
  switchConnection: (params: SwitchConnectionParameters) => Promise<void>
}

export type ConnectParameters = {
  connectorId: string
  namespace: ChainNamespace
  caipNetwork?: unknown
  preferredAccountType?: 'eoa' | 'smartAccount'
}

export type ReconnectParameters = {
  connectorId: string
  namespace: ChainNamespace
}

// -- Controller Implementation -------------------------- //

class ConnectionController {
  private state: ConnectionControllerState

  constructor() {
    this.state = this.initializeState()
  }

  private initializeState(): ConnectionControllerState {
    return {
      isSwitchingConnection: false,
      connections: new Map(),
      recentConnections: new Map(),
      walletConnectManager: this.createWalletConnectManager()
    }
  }

  private createWalletConnectManager(): WalletConnectConnectionManager {
    // Placeholder for WC manager - will be implemented later
    return {
      connectWalletConnect: async () => {
        // WalletConnect connection logic will be implemented here
      },
      resetWcConnection: () => {
        // WC connection reset logic will be implemented here
      },
      resetUri: () => {
        // URI reset logic will be implemented here
      },
      finalizeWcConnection: () => {
        // WC connection finalization logic will be implemented here
      },
      setWcBasic: () => {
        // WC basic setting logic will be implemented here
      },
      setUri: () => {
        // URI setting logic will be implemented here
      },
      setWcLinking: () => {
        // WC linking logic will be implemented here
      },
      setWcError: () => {
        // WC error setting logic will be implemented here
      },
      setRecentWallet: () => {
        // Recent wallet setting logic will be implemented here
      },
      setBuffering: () => {
        // Buffering setting logic will be implemented here
      },
      setStatus: () => {
        // Status setting logic will be implemented here
      }
    }
  }

  // -- Public API ------------------------------------- //

  public subscribe(_callback: (state: ConnectionControllerState) => void): () => void {
    // Placeholder for subscription logic - will be implemented with state management
    return () => {
      // Unsubscribe logic will be implemented here
    }
  }

  public subscribeKey<K extends keyof ConnectionControllerState>(
    _key: K,
    _callback: (value: ConnectionControllerState[K]) => void
  ): () => void {
    // Placeholder for subscription logic - will be implemented with state management
    return () => {
      // Unsubscribe logic will be implemented here
    }
  }

  public async connect(_params: ConnectParameters): Promise<void> {
    // Connection logic will be implemented here

    return Promise.resolve()
  }

  public async disconnect(_params?: DisconnectParameters): Promise<void> {
    // Disconnection logic will be implemented here

    return Promise.resolve()
  }

  public async reconnect(_params: ReconnectParameters): Promise<void> {
    // Reconnection logic will be implemented here

    return Promise.resolve()
  }

  public async switchConnection(_params: SwitchConnectionParameters): Promise<void> {
    // Connection switching logic will be implemented here

    return Promise.resolve()
  }

  public getConnectors(): Connector[] {
    return ConnectorController.getConnectors()
  }

  public getConnections(namespace?: ChainNamespace): Connection[] {
    if (!namespace) {
      return Array.from(this.state.connections.values()).flat()
    }

    return this.state.connections.get(namespace) || []
  }

  public getActiveConnection(namespace: ChainNamespace): Connection | undefined {
    const connections = this.getConnections(namespace)

    return connections.find(conn => conn.status === 'connected')
  }

  public hasAnyConnection(): boolean {
    return Array.from(this.state.connections.values()).some(connections => connections.length > 0)
  }
}

// -- Export -------------------------------------------- //

export { ConnectionController }
