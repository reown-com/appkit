import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import type { ChainNamespace } from '@reown/appkit-common'
import { ChainController, ProviderController } from '@reown/appkit-controllers'

import { type ConnectorType, createAppKit, useAppKitProvider } from '../../exports/vue-core.js'
import { useAppKitNetwork } from '../../exports/vue.js'
import { mainnet } from '../mocks/Networks.js'

const TestComponent = defineComponent({
  setup() {
    const state = useAppKitProvider('eip155')

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

  beforeAll(() => {
    createAppKit({
      projectId: 'test',
      networks: [mainnet]
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(ProviderController, 'state', 'get').mockReturnValue({
      ...ProviderController.state,
      providers: {
        eip155: { test: 'provider' }
      } as unknown as Record<ChainNamespace, ConnectorType>,
      providerIds: {
        eip155: 'test-provider'
      } as unknown as Record<ChainNamespace, ConnectorType>
    })

    vi.spyOn(ProviderController, 'subscribe').mockImplementation(callback => {
      mockSubscribe(callback)

      return mockUnsubscribe
    })
  })

  it('should initialize with correct initial state', () => {
    const wrapper = mount(TestComponent)

    expect(wrapper.get('[data-testid="provider"]').text()).toContain('test')
    expect(wrapper.get('[data-testid="type"]').text()).toBe('"test-provider"')
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
        eip155: { test: 'new-provider' }
      },
      providerIds: {
        eip155: 'new-provider-type'
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-testid="provider"]').text()).toContain('new-provider')
    expect(wrapper.get('[data-testid="type"]').text()).toBe('"new-provider-type"')
  })

  it('should unsubscribe on component unmount', () => {
    const wrapper = mount(TestComponent)

    wrapper.unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
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
    // @ts-expect-error - partial mock
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
    // @ts-expect-error - partial mock
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
