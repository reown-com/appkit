import { describe, expect, it, beforeEach } from 'vitest'

import { bitcoin } from '@reown/appkit/networks'

import { BitcoinFixtures, TestConstants, setupChainController, resetAllMocks } from '../index.js'

describe('Bitcoin Adapter Example Test', () => {
  beforeEach(() => {
    resetAllMocks()
    setupChainController([bitcoin], 'bip122')
  })

  describe('connect', () => {
    it('should connect using SatsConnect', async () => {
      const { adapter, satsConnectProvider } = BitcoinFixtures['satsConnectConnection']()
      
      const result = await adapter.connect({
        id: 'satsConnect',
        chainId: bitcoin.id,
        provider: satsConnectProvider.provider,
        type: 'INJECTED'
      })
      
      expect(result).toEqual({
        id: 'satsConnect',
        type: 'INJECTED',
        address: TestConstants.accounts.bitcoin[0].address,
        chainId: bitcoin.id
      })
    })
    
    it('should connect using WalletConnect', async () => {
      const { adapter, provider } = BitcoinFixtures['walletConnectConnection']()
      
      await adapter.setUniversalProvider(provider)
      await adapter.connectWalletConnect()
      
      expect(provider.connect).toHaveBeenCalled()
    })
  })
})
