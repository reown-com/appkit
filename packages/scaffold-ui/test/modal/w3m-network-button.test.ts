import { expect, html, fixture } from '@open-wc/testing'
import { ChainController, OptionsController } from '@reown/appkit-core'
import { W3mNetworkButton } from '../../src/modal/w3m-network-button'
import { describe, it, afterEach, vi } from 'vitest'
import type { CaipNetwork } from '@reown/appkit-common'

const mockCaipNetwork: CaipNetwork = {
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  id: 1,
  name: 'Test Network',
  nativeCurrency: { name: '', symbol: '', decimals: 0 },
  rpcUrls: { default: { http: [], webSocket: undefined } }
}

describe('W3mNetworkButton', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set isUnsupportedChain to false when allowUnsupportedChain is true', async () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
    vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mockCaipNetwork)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: true
    })

    const button = (await fixture(
      html`<w3m-network-button></w3m-network-button>`
    )) as W3mNetworkButton

    const networkButton = button.shadowRoot?.querySelector('wui-network-button')
    expect(networkButton).to.exist
    expect(networkButton?.isUnsupportedChain).to.equal(false)
  })

  it('should set isUnsupportedChain to true when allowUnsupportedChain is false and chain is unsupported', async () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
    vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mockCaipNetwork)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: false
    })

    const button = (await fixture(
      html`<w3m-network-button></w3m-network-button>`
    )) as W3mNetworkButton

    const networkButton = button.shadowRoot?.querySelector('wui-network-button')
    expect(networkButton).to.exist
    expect(networkButton?.isUnsupportedChain).to.equal(true)
  })

  it('should show "Switch Network" label when chain is unsupported and allowUnsupportedChain is false', async () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
    vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mockCaipNetwork)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: false
    })

    const button = await fixture(html`<w3m-network-button></w3m-network-button>`)
    const networkButton = button.shadowRoot?.querySelector('wui-network-button')

    expect(networkButton?.textContent?.trim()).to.equal('Switch Network')
  })

  it('should show network name when allowUnsupportedChain is true even if chain is unsupported', async () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
    vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mockCaipNetwork)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: true
    })

    const button = await fixture(html`<w3m-network-button></w3m-network-button>`)
    const networkButton = button.shadowRoot?.querySelector('wui-network-button')

    expect(networkButton?.textContent?.trim()).to.equal('Test Network')
  })
})
