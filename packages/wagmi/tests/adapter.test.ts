import { describe, expect, test, vi } from 'vitest'
import { connect, disconnect, getAccount as getAccount_wagmi } from '@wagmi/core'
import { ConstantsUtil } from '@rerock/appkit-utils'
import { appKitMock, wagmiAdapterMock, mockAccount } from './mocks/adapter.mock'
import { mainnet } from 'viem/chains'

describe('wagmi adapter', () => {
  test('should connect to adapter', async () => {
    expect(appKitMock.getConnectors().length).toBe(5)
    expect(appKitMock.getIsConnectedState()).toBe(false)
    expect(appKitMock.getCaipAddress()).toBeUndefined()

    const setApprovedCaipNetworksData = vi
      .spyOn(appKitMock, 'setApprovedCaipNetworksData')
      .mockResolvedValue()

    expect(wagmiAdapterMock.wagmiConfig).toBeDefined()

    await connect(wagmiAdapterMock.wagmiConfig!, {
      connector: wagmiAdapterMock.wagmiConfig!.connectors[0]!
    })

    expect(setApprovedCaipNetworksData).toHaveBeenCalledOnce()

    expect(appKitMock.getIsConnectedState()).toBe(true)
    expect(appKitMock.getCaipAddress()).toBe(
      `${ConstantsUtil.EIP155}:${mainnet.id}:${mockAccount.address}`
    )

    const wagmiAccount = getAccount_wagmi(wagmiAdapterMock.wagmiConfig!)

    expect(wagmiAccount.status).toBe('connected')
    expect(wagmiAccount.address).toBe(mockAccount.address)
  })

  test('should disconnect from adapter', async () => {
    expect(appKitMock.getIsConnectedState()).toBe(true)

    const resetAccount = vi.spyOn(appKitMock, 'resetAccount')
    const resetWcConnection = vi.spyOn(appKitMock, 'resetWcConnection')
    const resetNetwork = vi.spyOn(appKitMock, 'resetNetwork')

    await disconnect(wagmiAdapterMock.wagmiConfig!)

    expect(resetAccount).toHaveBeenCalledOnce()
    expect(resetWcConnection).toHaveBeenCalledOnce()
    expect(resetNetwork).toHaveBeenCalledOnce()

    expect(appKitMock.getIsConnectedState()).toBe(false)

    const wagmiAccount = getAccount_wagmi(wagmiAdapterMock.wagmiConfig!)

    expect(wagmiAccount.status).toBe('disconnected')
    expect(wagmiAccount.address).toBeUndefined()
  })
})
