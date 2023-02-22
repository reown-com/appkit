import { CoreUtil, ExplorerCtrl, OptionsCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { UiUtil } from '../utils/UiUtil'

@customElement('w3m-explorer-context')
export class W3mExplorerContext extends LitElement {
  // -- state & properties ------------------------------------------- //
  @state() private preload = true

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    // Load explorer and asset data
    this.preloadData()
  }

  // -- private ------------------------------------------------------ //
  private async preloadListings() {
    const { standaloneChains, chains, walletConnectVersion } = OptionsCtrl.state
    const chainsFilter = standaloneChains?.join(',')
    await Promise.all([
      ExplorerCtrl.getPreviewWallets({
        page: 1,
        entries: 10,
        chains: chainsFilter,
        device: CoreUtil.isMobile() ? 'mobile' : 'desktop',
        version: walletConnectVersion
      }),
      ExplorerCtrl.getRecomendedWallets()
    ])
    OptionsCtrl.setIsDataLoaded(true)
    const { previewWallets, recomendedWallets } = ExplorerCtrl.state
    const chainsImgs = chains?.map(chain => UiUtil.getChainIcon(chain.id)) ?? []
    const walletImgs = [...previewWallets, ...recomendedWallets].map(wallet => wallet.image_url.lg)
    await this.preloadListingImages([...chainsImgs, ...walletImgs])
  }

  private async preloadListingImages(images: string[]) {
    try {
      if (images.length) {
        await Promise.all(images.map(async url => UiUtil.preloadImage(url)))
      }
    } catch {
      console.info('Unsuccessful attempt at preloading some images')
    }
  }

  private async preloadCustomImages() {
    try {
      const images = UiUtil.getCustomImageUrls()
      if (images.length) {
        await Promise.all(images.map(async url => UiUtil.preloadImage(url)))
      }
    } catch {
      console.info('Unsuccessful attempt at preloading some images')
    }
  }

  private async preloadConnectorImages() {
    try {
      if (!OptionsCtrl.state.isStandalone) {
        const images = UiUtil.getConnectorImageUrls()
        if (images.length) {
          await Promise.all(images.map(async url => UiUtil.preloadImage(url)))
        }
      }
    } catch {
      console.info('Unsuccessful attempt at preloading some images')
    }
  }

  private async preloadData() {
    try {
      if (this.preload) {
        this.preload = false
        await Promise.all([
          this.preloadListings(),
          this.preloadCustomImages(),
          this.preloadConnectorImages()
        ])
      }
    } catch (err) {
      console.error(err)
      ToastCtrl.openToast('Failed preloading', 'error')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-explorer-context': W3mExplorerContext
  }
}
