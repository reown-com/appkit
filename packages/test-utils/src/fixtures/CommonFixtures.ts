import { TestConstants } from '../constants/TestConstants.js'
import { createMockBitcoinAdapter, createMockEvmAdapter, createMockSolanaAdapter } from '../mocks/MockAdapter.js'
import { mockAuthConnector, mockEthersBrowserProvider, mockEthersJsonRpcProvider } from '../mocks/EthersProvider.js'
import { mockBitcoinConnector, mockSatsConnectProvider } from '../mocks/BitcoinProvider.js'
import { mockSolanaConnection, mockSolanaWalletStandardProvider } from '../mocks/SolanaProvider.js'
import { mockBitcoinSession, mockEvmSession, mockSolanaSession, mockUniversalProvider } from '../mocks/UniversalProvider.js'

/**
 * Common test fixtures for EVM adapters
 */
export const EvmFixtures: Record<string, () => Record<string, any>> = {
  /**
   * Setup for testing EVM wallet connection
   */
  walletConnection: () => {
    const adapter = createMockEvmAdapter()
    const provider = mockEthersBrowserProvider()
    const connector = {
      id: 'injected',
      name: 'Browser Wallet',
      type: 'INJECTED',
      provider
    }
    
    return { adapter, provider, connector }
  },
  
  /**
   * Setup for testing EVM WalletConnect connection
   */
  walletConnectConnection: () => {
    const adapter = createMockEvmAdapter()
    const provider = mockUniversalProvider({
      session: mockEvmSession()
    })
    
    return { adapter, provider }
  },
  
  /**
   * Setup for testing EVM auth connection
   */
  authConnection: () => {
    const adapter = createMockEvmAdapter()
    const authProvider = mockAuthConnector()
    
    return { adapter, authProvider }
  },
  
  /**
   * Setup for testing EVM transactions
   */
  transaction: () => {
    const adapter = createMockEvmAdapter()
    const provider = mockEthersJsonRpcProvider()
    
    return { 
      adapter, 
      provider,
      transactionParams: {
        value: BigInt(1000),
        to: TestConstants.accounts.evm[1].address,
        data: '0x',
        gas: BigInt(21000),
        gasPrice: BigInt(2000000000)
      }
    }
  }
}

/**
 * Common test fixtures for Bitcoin adapters
 */
export const BitcoinFixtures: Record<string, () => Record<string, any>> = {
  /**
   * Setup for testing Bitcoin wallet connection
   */
  walletConnection: () => {
    const adapter = createMockBitcoinAdapter()
    const connector = mockBitcoinConnector()
    
    return { adapter, connector }
  },
  
  /**
   * Setup for testing Bitcoin SatsConnect connection
   */
  satsConnectConnection: () => {
    const adapter = createMockBitcoinAdapter()
    const satsConnectProvider = mockSatsConnectProvider()
    
    return { adapter, satsConnectProvider }
  },
  
  /**
   * Setup for testing Bitcoin WalletConnect connection
   */
  walletConnectConnection: () => {
    const adapter = createMockBitcoinAdapter()
    const provider = mockUniversalProvider({
      session: mockBitcoinSession()
    })
    
    return { adapter, provider }
  }
}

/**
 * Common test fixtures for Solana adapters
 */
export const SolanaFixtures: Record<string, () => Record<string, any>> = {
  /**
   * Setup for testing Solana wallet connection
   */
  walletConnection: () => {
    const adapter = createMockSolanaAdapter()
    const provider = mockSolanaWalletStandardProvider()
    
    return { adapter, provider }
  },
  
  /**
   * Setup for testing Solana WalletConnect connection
   */
  walletConnectConnection: () => {
    const adapter = createMockSolanaAdapter()
    const provider = mockUniversalProvider({
      session: mockSolanaSession()
    })
    
    return { adapter, provider }
  },
  
  /**
   * Setup for testing Solana transactions
   */
  transaction: () => {
    const adapter = createMockSolanaAdapter()
    const connection = mockSolanaConnection()
    
    return { adapter, connection }
  }
}
