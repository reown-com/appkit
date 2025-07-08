import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import type { ChainNamespace } from '@reown/appkit-common'
import { ProviderUtil } from '@reown/appkit-utils'

import { type ConnectorType, createAppKit, useAppKitProvider } from '../../exports/vue-core.js'
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

    vi.spyOn(ProviderUtil, 'state', 'get').mockReturnValue({
      ...ProviderUtil.state,
      providers: {
        eip155: { test: 'provider' }
      } as unknown as Record<ChainNamespace, ConnectorType>,
      providerIds: {
        eip155: 'test-provider'
      } as unknown as Record<ChainNamespace, ConnectorType>
    })

    vi.spyOn(ProviderUtil, 'subscribe').mockImplementation(callback => {
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
    expect(ProviderUtil.subscribe).toHaveBeenCalled()
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
