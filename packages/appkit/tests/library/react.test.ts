import { act, createElement } from 'react'

import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import { ChainController, ProviderController } from '@reown/appkit-controllers'

import { useAppKitProvider } from '../../exports/react'
import { AppKitProvider, type AppKitProviderProps } from '../../src/library/react/providers'
import { solana } from '../mocks/Networks'

let mod: typeof import('../../exports/react')

describe('AppKitProvider', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mod = await import('../../exports/react')
    vi.spyOn(mod, 'createAppKit')
  })

  it('should call createAppKit with the correct parameters', () => {
    const props = {
      projectId: 'test',
      networks: [],
      children: 'child'
    } as unknown as AppKitProviderProps

    const { rerender } = render(
      createElement(AppKitProvider, props, createElement('div', null, 'child'))
    )

    delete props.children

    expect(mod.createAppKit).toHaveBeenCalledTimes(1)
    expect(mod.createAppKit).toHaveBeenCalledWith(props)

    rerender(createElement('div', null, 'child'))

    expect(mod.createAppKit).toHaveBeenCalledTimes(1)
  })
})

describe('useAppKitProvider', () => {
  const originalActiveCaipNetwork = ChainController.state.activeCaipNetwork
  const originalActiveChain = ChainController.state.activeChain
  const originalProviders = { ...ProviderController.state.providers }

  function ProviderProbe({ renderCount }: { renderCount: { current: number } }) {
    const { walletProvider, walletProviderType } = useAppKitProvider<{ id: string }>('solana')
    renderCount.current += 1

    return createElement('div', null, [
      createElement('span', { key: 'p', 'data-testid': 'provider-id' }, walletProvider?.id ?? ''),
      createElement('span', { key: 't', 'data-testid': 'provider-type' }, walletProviderType ?? '')
    ])
  }

  beforeEach(() => {
    ProviderController.setProvider(ConstantsUtil.CHAIN.SOLANA, { id: 'phantom-mainnet' })
    ProviderController.setProviderId(ConstantsUtil.CHAIN.SOLANA, 'ANNOUNCED')
    ChainController.state.activeCaipNetwork = solana as CaipNetwork
    ChainController.state.activeChain = ConstantsUtil.CHAIN.SOLANA
  })

  afterEach(() => {
    ProviderController.state.providers = { ...originalProviders }
    ChainController.state.activeCaipNetwork = originalActiveCaipNetwork
    ChainController.state.activeChain = originalActiveChain
  })

  it('re-renders when activeCaipNetwork changes (Solana switchNetwork)', async () => {
    const renderCount = { current: 0 }

    let result: ReturnType<typeof render>
    await act(async () => {
      result = render(createElement(ProviderProbe, { renderCount }) as React.ReactElement)
    })

    expect((await result!.findByTestId('provider-id')).textContent).toBe('phantom-mainnet')
    const initialRenderCount = renderCount.current

    const solanaDevnet: CaipNetwork = {
      ...(solana as CaipNetwork),
      id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      caipNetworkId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      name: 'Solana Devnet'
    }

    await act(async () => {
      ChainController.setActiveCaipNetwork(solanaDevnet)
    })

    expect(renderCount.current).toBeGreaterThan(initialRenderCount)
  })
})
