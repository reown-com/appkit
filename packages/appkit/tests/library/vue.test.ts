import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import type { ChainNamespace } from '@reown/appkit-common'
import { ChainController, ProviderController } from '@reown/appkit-controllers'

import { type ConnectorType, createAppKit, useAppKitProvider } from '../../exports/vue-core.js'
import { useAppKitNetwork } from '../../exports/vue.js'
import { mainnet, solana } from '../mocks/Networks.js'

const TestComponent = defineComponent({
  setup() {
    const state = useAppKitProvider('solana')

    return { state }
  },
  render() {
    return h('div', {}, [
      h('div', { 'data-testid': 'provider' }, JSON.stringify(this.state.walletProvider)),
      h('div', { 'data-testid': 'type' }, JSON.stringify(this.state.walletProviderType))
    ])
  }
})

describe('useAppKitProvider', () => {
  const mockSubscribe = vi.fn()
  const mockUnsubscribe = vi.fn()
  const mockSubscribeNetworkKey = vi.fn()
  const mockUnsubscribeNetworkKey = vi.fn()

  beforeAll(() => {
    createAppKit({
      projectId: 'test',
      networks: [mainnet, solana]
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(ProviderController, 'state', 'get').mockReturnValue({
      ...ProviderController.state,
      providers: {
        solana: { test: 'solana-provider' }
      } as unknown as Record<ChainNamespace, ConnectorType>,
      providerIds: {
        solana: 'ANNOUNCED'
      } as unknown as Record<ChainNamespace, ConnectorType>
    })

    vi.spyOn(ProviderController, 'subscribe').mockImplementation(callback => {
      mockSubscribe(callback)

      return mockUnsubscribe
    })

    vi.spyOn(ChainController, 'subscribeKey').mockImplementation((key, callback) => {
      if (key === 'activeCaipNetwork') {
        mockSubscribeNetworkKey(callback)

        return mockUnsubscribeNetworkKey
      }

      return vi.fn()
    })
  })

  it('should initialize with correct initial state', () => {
    const wrapper = mount(TestComponent)

    expect(wrapper.get('[data-testid="provider"]').text()).toContain('solana-provider')
    expect(wrapper.get('[data-testid="type"]').text()).toBe('"ANNOUNCED"')
  })

  it('should subscribe to provider updates', () => {
    mount(TestComponent)

    expect(mockSubscribe).toHaveBeenCalled()
    expect(ProviderController.subscribe).toHaveBeenCalled()
  })

  it('should update state when provider changes', async () => {
    const wrapper = mount(TestComponent)

    const firstCallback = mockSubscribe.mock.calls[0]?.[0]

    firstCallback({
      providers: {
        solana: { test: 'new-solana-provider' }
      },
      providerIds: {
        solana: 'WALLET_CONNECT'
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-testid="provider"]').text()).toContain('new-solana-provider')
    expect(wrapper.get('[data-testid="type"]').text()).toBe('"WALLET_CONNECT"')
  })

  it('should re-fire when Solana switchNetwork updates activeCaipNetwork', async () => {
    const wrapper = mount(TestComponent)

    expect(ChainController.subscribeKey).toHaveBeenCalledWith(
      'activeCaipNetwork',
      expect.any(Function)
    )

    vi.spyOn(ProviderController, 'state', 'get').mockReturnValue({
      ...ProviderController.state,
      providers: {
        solana: { test: 'devnet-provider' }
      } as unknown as Record<ChainNamespace, ConnectorType>,
      providerIds: {
        solana: 'ANNOUNCED'
      } as unknown as Record<ChainNamespace, ConnectorType>
    })

    const networkCallback = mockSubscribeNetworkKey.mock.calls[0]?.[0]
    networkCallback?.()

    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-testid="provider"]').text()).toContain('devnet-provider')
    expect(wrapper.get('[data-testid="type"]').text()).toBe('"ANNOUNCED"')
  })

  it('should unsubscribe on component unmount', () => {
    const wrapper = mount(TestComponent)

    wrapper.unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
    expect(mockUnsubscribeNetworkKey).toHaveBeenCalled()
  })
})

describe('useAppKitNetwork', () => {
  const NetworkTestComponent = defineComponent({
    setup() {
      const state = useAppKitNetwork()

      return { state }
    },
    render() {
      return h('div', {}, [
        h(
          'div',
          { 'data-testid': 'approvedCaipNetworkIds' },
          JSON.stringify(this.state.approvedCaipNetworkIds)
        ),
        h(
          'div',
          { 'data-testid': 'supportsAllNetworks' },
          JSON.stringify(this.state.supportsAllNetworks)
        )
      ])
    }
  })

  let mockUnsubscribeKey: ReturnType<typeof vi.fn>
  let mockUnsubscribeChainProp: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockUnsubscribeKey = vi.fn()
    mockUnsubscribeChainProp = vi.fn()
    vi.spyOn(ChainController, 'subscribeKey').mockReturnValue(mockUnsubscribeKey)
    vi.spyOn(ChainController, 'subscribeChainProp').mockReturnValue(mockUnsubscribeChainProp)
  })

  it('should return defaults when no chain is active', () => {
    ChainController.state.activeChain = undefined

    const wrapper = mount(NetworkTestComponent)

    expect(wrapper.get('[data-testid="supportsAllNetworks"]').text()).toBe('true')
  })

  it('should return approved networks from chain networkState', () => {
    ChainController.state.activeChain = 'eip155'
    ChainController.state.chains = new Map([
      [
        'eip155',
        {
          networkState: {
            approvedCaipNetworkIds: ['eip155:1', 'eip155:137'],
            supportsAllNetworks: false
          }
        }
      ]
    ])

    const wrapper = mount(NetworkTestComponent)

    expect(wrapper.get('[data-testid="approvedCaipNetworkIds"]').text()).toBe(
      '["eip155:1","eip155:137"]'
    )
    expect(wrapper.get('[data-testid="supportsAllNetworks"]').text()).toBe('false')
  })

  it('should subscribe to activeCaipNetwork and networkState', () => {
    ChainController.state.activeChain = 'eip155'
    ChainController.state.chains = new Map([
      ['eip155', { networkState: { supportsAllNetworks: true } }]
    ])

    const wrapper = mount(NetworkTestComponent)

    expect(ChainController.subscribeKey).toHaveBeenCalledWith(
      'activeCaipNetwork',
      expect.any(Function)
    )
    expect(ChainController.subscribeChainProp).toHaveBeenCalledWith(
      'networkState',
      expect.any(Function)
    )

    wrapper.unmount()

    expect(mockUnsubscribeKey).toHaveBeenCalled()
    expect(mockUnsubscribeChainProp).toHaveBeenCalled()
  })
})
