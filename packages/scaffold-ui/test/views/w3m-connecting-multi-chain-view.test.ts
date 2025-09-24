import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil } from '@reown/appkit-common'
import type { ConnectorWithProviders } from '@reown/appkit-controllers'
import { ConnectorController, CoreHelperUtil, RouterController } from '@reown/appkit-controllers'

import { W3mConnectingMultiChainView } from '../../src/views/w3m-connecting-multi-chain-view'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mConnectingMultiChainView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  it('should push to ConnectingExternal with wallet parameter', async () => {
    const multiChainConnector = {
      id: 'multi',
      name: 'Multi Wallet',
      type: 'MULTI_CHAIN',
      chain: ConstantsUtil.CHAIN.EVM,
      explorerWallet: { id: 'multi', name: 'Multi Wallet' },
      connectors: [
        {
          id: 'evmProvider',
          name: 'EVM',
          chain: ConstantsUtil.CHAIN.EVM
        }
      ]
    } as unknown as ConnectorWithProviders

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnector: multiChainConnector
    })

    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(element, 'wui-list-chain-eip155')
    expect(walletSelector).not.toBeNull()
    walletSelector?.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingExternal', {
      connector: expect.objectContaining({ id: 'evmProvider' }),
      wallet: expect.objectContaining({ id: 'multi' })
    })
  })
})
