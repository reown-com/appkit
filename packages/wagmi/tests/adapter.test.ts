import { describe, expect, test, vi } from 'vitest'
import { connect, disconnect, getAccount as getAccount_wagmi } from '@wagmi/core'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { appKitMock, mockAccount, wagmiConfigMock } from './mocks/adapter.mock'
import { mainnet } from 'viem/chains'

describe('wagmi adapter', () => {
  test('should connect to adapter', async () => {
    expect(appKitMock.getConnectors().length).toBe(1)
    expect(appKitMock.getIsConnectedState()).toBe(false)
    expect(appKitMock.getCaipAddress()).toBeUndefined()

    const setApprovedCaipNetworksData = vi
      .spyOn(appKitMock, 'setApprovedCaipNetworksData')
      .mockResolvedValue()

    await connect(wagmiConfigMock, { connector: wagmiConfigMock.connectors[0]! })

    expect(setApprovedCaipNetworksData).toHaveBeenCalledOnce()

    expect(appKitMock.getIsConnectedState()).toBe(true)
    expect(appKitMock.getCaipAddress()).toBe(
      `${ConstantsUtil.EIP155}:${mainnet.id}:${mockAccount.address}`
    )

    const wagmiAccount = getAccount_wagmi(wagmiConfigMock)

    expect(wagmiAccount.status).toBe('connected')
    expect(wagmiAccount.address).toBe(mockAccount.address)
  })

  test('should disconnect from adapter', async () => {
    // Check if already connected
    expect(appKitMock.getIsConnectedState()).toBe(true)

    const resetAccount = vi.spyOn(appKitMock, 'resetAccount').mockResolvedValue()
    const resetWcConnection = vi.spyOn(appKitMock, 'resetWcConnection').mockResolvedValue()
    const resetNetwork = vi.spyOn(appKitMock, 'resetNetwork').mockResolvedValue()

    await disconnect(wagmiConfigMock)

    expect(resetAccount).toHaveBeenCalledOnce()
    expect(resetWcConnection).toHaveBeenCalledOnce()
    expect(resetNetwork).toHaveBeenCalledOnce()

    expect(appKitMock.getIsConnectedState()).toBe(false)

    const wagmiAccount = getAccount_wagmi(wagmiConfigMock)

    expect(wagmiAccount.status).toBe('disconnected')
    expect(wagmiAccount.address).toBeUndefined()
  })
})
