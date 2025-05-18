import { PublicKey } from '@solana/web3.js'
import base58 from 'bs58'

import { bitcoin, bitcoinTestnet, mainnet, polygon, solana } from '@reown/appkit/networks'

/**
 * Shared test constants for all adapters
 */
export const TestConstants = {
  accounts: {
    evm: [
      {
        address: '0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831',
        type: 'eoa'
      },
      {
        address: '0xE62a3eD41B21447b67a63880607CD2E746A0E35d',
        type: 'eoa'
      }
    ],
    solana: [
      {
        address: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP',
        publicKey: new PublicKey(base58.decode('2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP')),
        type: 'eoa'
      },
      {
        address: '2vRxHxMEmhTCJ4jctfso2MVZvaQkHQxXf9riMNS3CjSu',
        publicKey: new PublicKey(base58.decode('2vRxHxMEmhTCJ4jctfso2MVZvaQkHQxXf9riMNS3CjSu')),
        type: 'eoa'
      }
    ],
    bitcoin: [
      {
        address: 'bc1qtest',
        publicKey: '0123456789abcdef',
        path: "m/84'/0'/0'/0/0",
        purpose: 'payment',
        type: 'eoa'
      },
      {
        address: 'bc1qtest2',
        publicKey: 'fedcba9876543210',
        path: "m/84'/0'/0'/0/1",
        purpose: 'payment',
        type: 'eoa'
      }
    ]
  },
  
  networks: {
    evm: [mainnet, polygon],
    solana: [solana],
    bitcoin: [bitcoin, bitcoinTestnet]
  },
  
  balances: {
    evm: { balance: '1.00', symbol: 'ETH' },
    solana: { balance: '1.00', symbol: 'SOL' },
    bitcoin: { balance: '1.00', symbol: 'BTC' }
  },
  
  signatures: {
    evm: '0x123456789abcdef',
    solana: '5bW5EoLn696QKxgJbsDb1aXrBf9hSUvvCa9FbyRt6CyppX4cQMJWyKx736ka5WDKqCZaoVivpWaxHhcAbSwhNx6Qp5Df3cHvSkg7jSX8PVw7FMKv45B5ZaeLjYHubDVsQEFFAs3Ea1CZU7X8xCv2JbhQvoxMoFWAKxUyFbM3DFH4KzuLL5nMZ9ybkiYfGdAAzwfMTDFLY7ymdzG12mWpvPwLJnwECDgHG7BogzZBdehndK8KP5sPLY5VcgVp5D87crr7XhUwmw5QLtDjPMnp4YKwApSS58jVNw3Zy',
    bitcoin: 'base64signature'
  }
} as const

/**
 * Type definitions for TestConstants
 */
export namespace TestConstants {
  export type EvmAccount = {
    address: string
    type: string
  }
  
  export type SolanaAccount = {
    address: string
    publicKey: PublicKey
    type: string
  }
  
  export type BitcoinAccount = {
    address: string
    publicKey: string
    path: string
    purpose: string
    type: string
  }
  
  export type Balance = {
    balance: string
    symbol: string
  }
}
