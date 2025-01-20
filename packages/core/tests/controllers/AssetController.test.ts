import { describe, expect, it } from 'vitest'

import { AssetController } from '../../exports/index.js'

// -- Constants ----------------------------------------------------------------
const walletImage = 'w3mWallet.png'
const walletImage2 = 'w3mWallet2.png'
const networkImage = 'ethereum.png'
const networkImage2 = 'polygon.png'
const connectorImage = 'email-connector.png'
const connectorImage2 = 'metamask-connector.png'
const tokenImage = 'eth.png'
const tokenImage2 = 'usdc.png'
const currencyImage = 'usd.png'
const currencyImage2 = 'eur.png'

const wallet = 'w3m'
const wallet2 = 'w4m'
const network = 'ethereum'
const network2 = 'polygon'
const connector = 'w3m-email'
const connector2 = 'mm-connector'
const token = 'ETH'
const token2 = 'MATIC'
const currency = 'USD'
const currency2 = 'EUR'

// -- Tests --------------------------------------------------------------------
describe('AssetController', () => {
  it('should have valid default state', () => {
    expect(AssetController.state).toEqual({
      chainImages: {},
      walletImages: {},
      networkImages: {},
      connectorImages: {},
      tokenImages: {},
      currencyImages: {}
    })
  })

  it('should update state properly on setWalletImage()', () => {
    AssetController.setWalletImage(wallet, walletImage)
    expect(AssetController.state.walletImages).toEqual({ [wallet]: walletImage })

    AssetController.setWalletImage(wallet, walletImage2)
    expect(AssetController.state.walletImages).toEqual({ [wallet]: walletImage2 })

    AssetController.setWalletImage(wallet2, walletImage2)
    expect(AssetController.state.walletImages).toEqual({
      [wallet]: walletImage2,
      [wallet2]: walletImage2
    })
  })

  it('should update state properly on setNetworkImage()', () => {
    AssetController.setNetworkImage(network, networkImage)
    expect(AssetController.state.networkImages).toEqual({ [network]: networkImage })

    AssetController.setNetworkImage(network, networkImage2)
    expect(AssetController.state.networkImages).toEqual({ [network]: networkImage2 })

    AssetController.setNetworkImage(network2, networkImage2)
    expect(AssetController.state.networkImages).toEqual({
      [network]: networkImage2,
      [network2]: networkImage2
    })
  })

  it('should update state properly on setConnectorImage()', () => {
    AssetController.setConnectorImage(connector, connectorImage)
    expect(AssetController.state.connectorImages).toEqual({ [connector]: connectorImage })

    AssetController.setConnectorImage(connector, connectorImage2)
    expect(AssetController.state.connectorImages).toEqual({ [connector]: connectorImage2 })

    AssetController.setConnectorImage(connector2, connectorImage2)
    expect(AssetController.state.connectorImages).toEqual({
      [connector]: connectorImage2,
      [connector2]: connectorImage2
    })
  })

  it('should update state properly on setTokenImage()', () => {
    AssetController.setTokenImage(token, tokenImage)
    expect(AssetController.state.tokenImages).toEqual({ [token]: tokenImage })

    AssetController.setTokenImage(token, tokenImage2)
    expect(AssetController.state.tokenImages).toEqual({ [token]: tokenImage2 })

    AssetController.setTokenImage(token2, tokenImage2)
    expect(AssetController.state.tokenImages).toEqual({
      [token]: tokenImage2,
      [token2]: tokenImage2
    })
  })

  it('should update state properly on setCurrencyImage()', () => {
    AssetController.setCurrencyImage(currency, currencyImage)
    expect(AssetController.state.currencyImages).toEqual({ [currency]: currencyImage })

    AssetController.setCurrencyImage(currency, currencyImage2)
    expect(AssetController.state.currencyImages).toEqual({ [currency]: currencyImage2 })

    AssetController.setCurrencyImage(currency2, currencyImage2)
    expect(AssetController.state.currencyImages).toEqual({
      [currency]: currencyImage2,
      [currency2]: currencyImage2
    })
  })
})
