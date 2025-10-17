'use client';

import type { CaipNetwork } from '@reown/appkit-common';
import type { PolkadotProvider, PolkadotAccount, PolkadotWalletSource } from '../providers/PolkadotProvider.js';

/**
 * Event emitter for Polkadot connectors
 * Mimics AppKit's internal ProviderEventEmitter
 */
class PolkadotEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`[PolkadotEventEmitter] Error in ${event} listener:`, error);
        }
      });
    }
  }

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * Polkadot connector provider that matches AppKit's expected interface
 * Extends event emitter to match WalletStandardProvider pattern
 */
export class PolkadotConnectorProvider extends PolkadotEventEmitter {
  public id: string;
  public type: 'INJECTED' | 'ANNOUNCED' | 'EXTERNAL';
  public name: string;
  public imageUrl?: string;
  public provider: PolkadotProvider | null;
  public accounts: PolkadotAccount[];
  public chains: CaipNetwork[];
  public chain: string;
  public namespace: string = 'polkadot';

  private source: PolkadotWalletSource;
  private connectHandler: (source: PolkadotWalletSource) => Promise<any>;

  constructor(config: {
    id: string;
    source: PolkadotWalletSource;
    name: string;
    imageUrl?: string;
    chains: CaipNetwork[];
    chain: string;
    connectHandler: (source: PolkadotWalletSource) => Promise<any>;
  }) {
    super();
    this.id = config.id;
    this.source = config.source;
    this.name = config.name;
    this.imageUrl = config.imageUrl;
    this.chains = config.chains;
    this.chain = config.chain;
    this.connectHandler = config.connectHandler;
    this.type = 'INJECTED';
    // IMPORTANT: Set provider to this (like WalletStandardProvider does)
    // This tells AppKit that this connector is ready to be used
    this.provider = this as any;
    this.accounts = [];
    
    console.log(`[PolkadotConnectorProvider] Created connector:`, {
      id: this.id,
      name: this.name,
      type: this.type,
      hasProvider: !!this.provider,
      hasChainsConnect: !!this.chains,
    });

    // Bind Polkadot extension events (like WalletStandardProvider.bindEvents())
    this.bindEvents();
  }

  /**
   * Bind Polkadot extension events
   * Similar to WalletStandardProvider.bindEvents() but for Polkadot extensions
   */
  private bindEvents(): void {
    // Polkadot extensions use a different event system than wallet-standard
    // They emit events through their accounts.subscribe() API
    // However, we don't need to bind these at construction time since
    // the connection will be established through our connectHandler
    console.log(`[PolkadotConnectorProvider] Event bindings initialized for ${this.name}`);
  }

  /**
   * Connect to the wallet
   * This is called by AppKit when user clicks the connector in the modal
   */
  async connect(params?: { chainId?: string; socialUri?: string }): Promise<string> {
    console.log(`[PolkadotConnectorProvider] ========================================`);
    console.log(`[PolkadotConnectorProvider] CONNECT CALLED FOR ${this.name}`);
    console.log(`[PolkadotConnectorProvider] Params:`, params);
    console.log(`[PolkadotConnectorProvider] Source:`, this.source);
    console.log(`[PolkadotConnectorProvider] ========================================`);
    
    try {
      const result = await this.connectHandler(this.source);
      console.log(`[PolkadotConnectorProvider] Connection result:`, result);
      
      // Emit connect event like AppKit expects
      this.emit('connect', result.address);
      
      return result.address;
    } catch (error) {
      console.error(`[PolkadotConnectorProvider] Connection failed:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get accounts from the connector
   */
  async getAccounts(): Promise<Array<{ namespace: string; address: string; type: string }>> {
    return this.accounts.map(account => ({
      namespace: this.namespace,
      address: account.address,
      type: 'eoa',
    }));
  }

  /**
   * Disconnect (not typically used for injected wallets)
   */
  async disconnect(): Promise<void> {
    this.provider = null;
    this.accounts = [];
    this.emit('disconnect');
  }

  /**
   * Check if wallet is installed
   */
  isInstalled(): boolean {
    return typeof window !== 'undefined' && !!(window as any).injectedWeb3?.[this.source];
  }
}

