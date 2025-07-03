import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'

import { ApiController } from '../../src/controllers/ApiController.js'
import { AssetController } from '../../src/controllers/AssetController.js'
import { AssetUtil } from '../../src/utils/AssetUtil.js'
import type { Connector, WcWallet } from '../../src/utils/TypeUtil.js'

// - Mocks ---------------------------------------------------------------------
const connector: Partial<Connector> = {
  imageUrl: undefined,
  imageId: 'walletconnect'
}
const connectorWithImageUrl: Partial<Connector> = {
  imageUrl: 'walletconnect-connector-logo-src',
  imageId: 'walletconnect'
}
const network: Partial<CaipNetwork> = {
  assets: {
    imageUrl: undefined,
    imageId: 'ethereum'
  }
}
const networkWithImageUrl: Partial<CaipNetwork> = {
  assets: {
    imageUrl: 'ethereum-logo-src',
    imageId: 'ethereum'
  }
}
const wallet: Partial<WcWallet> = {
  image_url: undefined,
  image_id: 'metamask'
}
const walletWithImageUrl: Partial<WcWallet> = {
  image_url: 'metamask-logo-src',
  image_id: 'metamask'
}

// -- Setup --------------------------------------------------------------------
ApiController._fetchWalletImage = vi.fn().mockImplementation((walletId: string) => {
  AssetController.state = {
    ...AssetController.state,
    walletImages: {
      ...AssetController.state.walletImages,
      [walletId]: `new-wallet-image-url-${walletId}`
    }
  }
})
beforeEach(() => {
  AssetController.state = {
    ...AssetController.state,
    connectorImages: {
      walletconnect: 'walletconnect-connector-logo-blob-url'
    },
    walletImages: {
      metamask: 'metamask-logo-blob-url'
    },
    networkImages: {
      ethereum: 'ethereum-logo-blob-url'
    }
  }
})

// -- Tests --------------------------------------------------------------------
describe('AssetUtil', () => {
  it('should get the connector image from connector object', () => {
    // @ts-expect-error it's a partial connector object
    expect(AssetUtil.getConnectorImage(connectorWithImageUrl)).toBe(
      'walletconnect-connector-logo-src'
    )
  })

  it('should call ApiController._fetchNetworkImage if image does not exist', async () => {
    const imageId = 'test-image-1'
    vi.spyOn(AssetUtil, 'getNetworkImageById').mockReturnValue(undefined)
    const fetchSpy = vi.spyOn(ApiController, '_fetchNetworkImage').mockResolvedValue({} as any)

    await AssetUtil.fetchNetworkImage(imageId)

    expect(fetchSpy).toHaveBeenCalledWith(imageId)
  })

  it('should not call ApiController._fetchNetworkImage if image exists', async () => {
    const imageId = 'test-image-2'
    vi.spyOn(AssetUtil, 'getNetworkImageById').mockReturnValue({} as any) // Mock that image exists
    const fetchSpy = vi.spyOn(ApiController, '_fetchNetworkImage')

    await AssetUtil.fetchNetworkImage(imageId)

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should get the connector image from AssetController state', () => {
    // @ts-expect-error it's a partial connector object
    expect(AssetUtil.getConnectorImage(connector)).toBe('walletconnect-connector-logo-blob-url')
  })

  it('should get the network image from network object', () => {
    // @ts-expect-error it's a partial connector object
    expect(AssetUtil.getNetworkImage(networkWithImageUrl)).toBe('ethereum-logo-src')
  })

  it('should get the network image from AssetController state', () => {
    // @ts-expect-error it's a partial connector object
    expect(AssetUtil.getNetworkImage(network)).toBe('ethereum-logo-blob-url')
  })

  it('should get the wallet image from wallet object', () => {
    // @ts-expect-error it's a partial connector object
    expect(AssetUtil.getWalletImage(walletWithImageUrl)).toBe('metamask-logo-src')
  })

  it('should get the wallet image from AssetController state', () => {
    // @ts-expect-error it's a partial connector object
    expect(AssetUtil.getWalletImage(wallet)).toBe('metamask-logo-blob-url')
  })

  it('should get the wallet with image id', () => {
    expect(AssetUtil.getWalletImageById(wallet.image_id)).toBe('metamask-logo-blob-url')
  })

  it('should fetch the wallet with image id', async () => {
    expect(await AssetUtil.fetchWalletImage('rainbow-id')).toBe('new-wallet-image-url-rainbow-id')
  })
})
