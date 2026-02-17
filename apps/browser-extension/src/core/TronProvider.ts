/* eslint-disable @typescript-eslint/no-require-imports */
import bs58 from 'bs58'
import { privateKeyToAccount } from 'viem/accounts'

import { AccountUtil } from '../utils/AccountUtil'

/**
 * Derive a TRON base58check address from an Ethereum hex address.
 * TRON addresses = 0x41 + last 20 bytes of keccak256(pubkey), base58check encoded.
 * Since we already have the ETH address (same key), we just swap the prefix.
 */
function ethAddressToTron(ethAddress: string): string {
  // Remove 0x prefix
  const hex = ethAddress.slice(2)
  const addressBytes = Buffer.from(hex, 'hex')

  // TRON uses 0x41 prefix instead of Ethereum's implicit 0x prefix
  const tronBytes = Buffer.alloc(21)
  tronBytes[0] = 0x41
  addressBytes.copy(tronBytes, 1)

  // Double SHA-256 for checksum (crypto-browserify provides sync createHash)
  const crypto = require('crypto')
  const hash1 = crypto.createHash('sha256').update(tronBytes).digest()
  const hash2 = crypto.createHash('sha256').update(hash1).digest()
  const checksum = hash2.slice(0, 4)

  const full = Buffer.alloc(25)
  tronBytes.copy(full, 0)
  checksum.copy(full, 21)

  return bs58.encode(full)
}

// Derive TRON address from EVM private key (same secp256k1 curve)
const evmAccount = privateKeyToAccount(AccountUtil.privateKeyEvm)
const tronAddress = ethAddressToTron(evmAccount.address)
const tronHexAddress = `41${evmAccount.address.slice(2)}`

type EventHandler = (...args: unknown[]) => void

/**
 * Sign a message using the EVM account's secp256k1 key.
 * Returns a hex signature string.
 */
async function signMessageWithKey(message: string): Promise<string> {
  const messageBytes = new TextEncoder().encode(message)
  const signature = await evmAccount.signMessage({ message: { raw: messageBytes } })

  return signature
}

export class TronProvider {
  private connected = false
  private listeners: Record<string, EventHandler[]> = {}

  // Properties that TronLinkAdapter checks (must be on the instance, not just tronWeb)
  readonly isTronLink = true
  /* Unique identifier for Reown */
  readonly isReownWallet = true
  ready = true
  address: string | null = null

  // Current chain ID (TRON mainnet)
  /* 728126428 in decimal */
  private chainId = '0x2b6653dc'

  /**
   * TronLink adapter reads wallet.tronWeb for:
   * - _updateWallet(): wallet.tronWeb.defaultAddress.base58
   * - waitTronwebReady(): tronObj.tronWeb (truthy check)
   * - signMessage(): wallet.tronWeb.trx.signMessageV2(message)
   * - signTransaction(): wallet.tronWeb.trx.sign(transaction)
   */
  tronWeb = {
    ready: true,
    defaultAddress: {
      base58: tronAddress as string | false,
      hex: tronHexAddress as string | false
    },
    trx: {
      async signMessageV2(message: string): Promise<string> {
        return signMessageWithKey(message)
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sign(transaction: unknown, _privateKey?: string): unknown {
        // For E2E testing, return a signed transaction stub
        return { txid: `0x${'a'.repeat(64)}`, result: true }
      }
    }
  }

  connect(): string {
    this.connected = true
    this.address = tronAddress
    this.tronWeb.ready = true
    this.tronWeb.defaultAddress.base58 = tronAddress
    this.tronWeb.defaultAddress.hex = tronHexAddress
    this.emit('connect', tronAddress)
    // Emit accountsChanged event for TronLink adapter compatibility
    this.emit('accountsChanged', [tronAddress])

    return tronAddress
  }

  disconnect(): void {
    this.connected = false
    this.address = null
    this.tronWeb.ready = false
    this.tronWeb.defaultAddress.base58 = false
    this.tronWeb.defaultAddress.hex = false
    this.emit('disconnect')
    // Emit accountsChanged event with empty array when disconnecting
    this.emit('accountsChanged', [])
  }

  request({ method, params }: { method: string; params?: unknown }): unknown {
    switch (method) {
      // TIP-1193 protocol: TronLinkAdapter calls eth_requestAccounts (not tron_requestAccounts)
      case 'eth_requestAccounts':
      case 'tron_requestAccounts': {
        this.connect()

        return [tronAddress]
      }

      case 'tron_accounts':
      case 'eth_accounts': {
        return this.connected ? [tronAddress] : []
      }

      case 'tron_chainId':
      case 'eth_chainId':
        return this.chainId

      case 'wallet_switchEthereumChain': {
        // TronLink adapter calls this to switch chains
        const switchParams = params as [{ chainId: string }] | undefined
        if (switchParams?.[0]?.chainId) {
          const newChainId = switchParams[0].chainId
          this.chainId = newChainId

          // Emit chainChanged event
          this.emit('chainChanged', newChainId)

          // If connected, also emit accountsChanged to trigger re-sync
          if (this.connected) {
            this.emit('accountsChanged', [tronAddress])
          }

          return null
        }

        throw new Error('Invalid chain switch params')
      }

      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(handler)
  }

  removeListener(event: string, handler: EventHandler): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler)
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    ;(this.listeners[event] || []).forEach(handler => handler(...args))
  }

  /** Returns the TRON base58 address for display purposes. */
  getAddress(): string {
    return tronAddress
  }
}
