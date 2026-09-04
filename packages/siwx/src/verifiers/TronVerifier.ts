import bs58 from 'bs58'
import { concat, hashMessage, keccak256, recoverAddress, toBytes, toHex } from 'viem'

import { ConstantsUtil } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

import { SIWXVerifier } from '../core/SIWXVerifier.js'

/**
 * Default verifier for TRON sessions.
 *
 * TRON uses secp256k1 signatures like Ethereum but with a different message prefix
 * and address encoding (Base58Check with 0x41 prefix for mainnet).
 */
export class TronVerifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.TRON

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      const tronAddress = session.data.accountAddress
      const evmAddress = this.tronAddressToEvmAddress(tronAddress)
      const message = session.message.toString()
      const signature = session.signature as `0x${string}`

      // Try TRON-specific message hash first (used by TronLink and most TRON wallets)
      const tronMessageHash = this.hashTronMessage(message)
      const recoveredFromTron = await recoverAddress({
        hash: tronMessageHash,
        signature
      })

      if (recoveredFromTron.toLowerCase() === evmAddress.toLowerCase()) {
        return true
      }

      // Fallback to standard EIP-191 message hash (some wallets may use this)
      const evmMessageHash = hashMessage(message)
      const recoveredFromEvm = await recoverAddress({
        hash: evmMessageHash,
        signature
      })

      return recoveredFromEvm.toLowerCase() === evmAddress.toLowerCase()
    } catch (error) {
      return false
    }
  }

  /**
   * Converts a TRON address (Base58Check with 0x41 prefix) to an EVM-compatible address.
   *
   * TRON mainnet addresses start with 'T' and are encoded as:
   * Base58Check(0x41 + 20-byte-address + 4-byte-checksum)
   */
  private tronAddressToEvmAddress(tronAddress: string): `0x${string}` {
    // Handle case where address is already in hex format
    if (tronAddress.startsWith('0x')) {
      return tronAddress as `0x${string}`
    }

    // Handle hex format with 41 prefix (e.g., "41...")
    if (tronAddress.startsWith('41') && tronAddress.length === 42) {
      return `0x${tronAddress.slice(2)}`
    }

    // Decode Base58Check TRON address
    const decoded = bs58.decode(tronAddress)

    /*
     * Remove the 0x41 prefix (first byte) and 4-byte checksum (last 4 bytes)
     * TRON address: 1 byte prefix + 20 bytes address + 4 bytes checksum = 25 bytes
     */
    const addressBytes = decoded.slice(1, 21)

    return toHex(addressBytes)
  }

  /**
   * Hashes a message using TRON's signMessageV2 format (TIP-191 compliant).
   *
   * TRON uses: keccak256("\x19TRON Signed Message:\n" + message.length + message)
   * This is similar to EIP-191 but with "TRON" instead of "Ethereum".
   */
  private hashTronMessage(message: string): `0x${string}` {
    const messageBytes = toBytes(message)
    const prefix = toBytes(`\x19TRON Signed Message:\n${messageBytes.length}`)
    const prefixedMessage = concat([prefix, messageBytes])

    return keccak256(prefixedMessage)
  }
}
