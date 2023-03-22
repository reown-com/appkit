import type { WalletRouteData } from '@web3modal/core'
import {
  ClientCtrl,
  ConfigCtrl,
  CoreUtil,
  ExplorerCtrl,
  ModalCtrl,
  OptionsCtrl,
  ToastCtrl
} from '@web3modal/core'
import type { LitElement } from 'lit'
import { ChainPresets } from '../presets/ChainPresets'
import { EthereumPresets } from '../presets/EthereumPresets'
import { TokenPresets } from '../presets/TokenPresets'

export const UiUtil = {
  MOBILE_BREAKPOINT: 600,

  W3M_RECENT_WALLET_DATA: 'W3M_RECENT_WALLET_DATA',

  EXPLORER_WALLET_URL: 'https://explorer.walletconnect.com/?type=wallet',

  rejectStandaloneButtonComponent() {
    const { isStandalone } = OptionsCtrl.state
    if (isStandalone) {
      throw new Error('Web3Modal button components are not available in standalone mode.')
    }
  },

  getShadowRootElement(root: LitElement, selector: string) {
    const el = root.renderRoot.querySelector(selector)
    if (!el) {
      throw new Error(`${selector} not found`)
    }

    return el as HTMLElement
  },

  getWalletId(id: string) {
    return EthereumPresets.getInjectedId(id)
  },

  getWalletIcon({ id, image_id, imageId }: { id: string; image_id?: string; imageId?: string }) {
    const presets = EthereumPresets.injectedPreset
    const presetImageId = presets[id]?.icon
    const { walletImages } = ConfigCtrl.state

    if (walletImages?.[id]) {
      return walletImages[id]
    } else if (image_id) {
      return ExplorerCtrl.getWalletImageUrl(image_id)
    } else if (imageId) {
      return ExplorerCtrl.getWalletImageUrl(imageId)
    } else if (presetImageId) {
      return ExplorerCtrl.getAssetImageUrl(presetImageId)
    }

    return ''
  },

  getWalletName(name: string, short = false) {
    const injectedName = EthereumPresets.getInjectedName(name)

    return short ? injectedName.split(' ')[0] : injectedName
  },

  getChainIcon(chainId: number | string) {
    const imageId = ChainPresets[chainId]
    const { projectId, chainImages } = ConfigCtrl.state

    return (
      chainImages?.[chainId] ?? (projectId && imageId ? ExplorerCtrl.getAssetImageUrl(imageId) : '')
    )
  },

  getTokenIcon(symbol: string) {
    const imageId = TokenPresets[symbol]?.icon
    const { projectId, tokenImages } = ConfigCtrl.state

    return (
      tokenImages?.[symbol] ?? (projectId && imageId ? ExplorerCtrl.getAssetImageUrl(imageId) : '')
    )
  },

  isMobileAnimation() {
    return window.innerWidth <= UiUtil.MOBILE_BREAKPOINT
  },

  async preloadImage(src: string) {
    const imagePromise = new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = resolve
      image.onerror = reject
      image.src = src
    })

    return Promise.race([imagePromise, CoreUtil.wait(3_000)])
  },

  getErrorMessage(err: unknown) {
    return err instanceof Error ? err.message : 'Unknown Error'
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debounce(func: (...args: any[]) => unknown, timeout = 500) {
    let timer: NodeJS.Timeout | undefined = undefined

    return (...args: unknown[]) => {
      function next() {
        func(...args)
      }
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(next, timeout)
    }
  },

  async handleMobileLinking(wallet: WalletRouteData) {
    CoreUtil.removeWalletConnectDeepLink()
    const { standaloneUri, selectedChain } = OptionsCtrl.state
    const { universalUrl, nativeUrl, name } = wallet

    function onRedirect(uri: string) {
      let href = ''
      if (nativeUrl) {
        href = CoreUtil.formatUniversalUrl(nativeUrl, uri, name)
      } else if (universalUrl) {
        href = CoreUtil.formatNativeUrl(universalUrl, uri, name)
      }
      CoreUtil.openHref(href, '_self')
    }

    if (standaloneUri) {
      UiUtil.setRecentWallet(wallet)
      onRedirect(standaloneUri)
    } else {
      await ClientCtrl.client().connectWalletConnect(uri => {
        onRedirect(uri)
      }, selectedChain?.id)
      UiUtil.setRecentWallet(wallet)
      ModalCtrl.close()
    }
  },

  async handleAndroidLinking() {
    CoreUtil.removeWalletConnectDeepLink()
    const { standaloneUri, selectedChain } = OptionsCtrl.state

    if (standaloneUri) {
      CoreUtil.openHref(standaloneUri, '_self')
    } else {
      await ClientCtrl.client().connectWalletConnect(uri => {
        CoreUtil.setWalletConnectAndroidDeepLink(uri)
        CoreUtil.openHref(uri, '_self')
      }, selectedChain?.id)

      ModalCtrl.close()
    }
  },

  async handleUriCopy() {
    const { standaloneUri } = OptionsCtrl.state
    if (standaloneUri) {
      await navigator.clipboard.writeText(standaloneUri)
    } else {
      const uri = ClientCtrl.client().walletConnectUri
      await navigator.clipboard.writeText(uri)
    }
    ToastCtrl.openToast('Link copied', 'success')
  },

  async handleConnectorConnection(id: string, onError?: () => void) {
    try {
      const { selectedChain } = OptionsCtrl.state
      await ClientCtrl.client().connectConnector(id, selectedChain?.id)
      ModalCtrl.close()
    } catch (err) {
      console.error(err)
      if (onError) {
        onError()
      } else {
        ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
      }
    }
  },

  getCustomWallets() {
    const { desktopWallets, mobileWallets } = ConfigCtrl.state

    return (CoreUtil.isMobile() ? mobileWallets : desktopWallets) ?? []
  },

  getCustomImageUrls() {
    const { chainImages, walletImages } = ConfigCtrl.state
    const chainUrls = Object.values(chainImages ?? {})
    const walletUrls = Object.values(walletImages ?? {})

    return Object.values([...chainUrls, ...walletUrls])
  },

  getConnectorImageUrls() {
    const connectors = ClientCtrl.client().getConnectors()
    const ids = connectors.map(({ id }) => EthereumPresets.getInjectedId(id))
    const images = ids.map(id => UiUtil.getWalletIcon({ id }))

    return images
  },

  truncate(value: string, strLen = 8) {
    if (value.length <= strLen) {
      return value
    }

    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
  },

  generateAvatarColors(address: string) {
    // eslint-disable-next-line require-unicode-regexp
    const seedArr = address.match(/.{1,7}/g)?.splice(0, 5)
    const colors: string[] = []

    seedArr?.forEach(seed => {
      let hash = 0
      for (let i = 0; i < seed.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = seed.charCodeAt(i) + ((hash << 5) - hash)
        // eslint-disable-next-line operator-assignment, no-bitwise
        hash = hash & hash
      }

      const rgb = [0, 0, 0]
      for (let i = 0; i < 3; i += 1) {
        // eslint-disable-next-line no-bitwise
        const value = (hash >> (i * 8)) & 255
        rgb[i] = value
      }
      colors.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`)
    })

    const root: HTMLElement | null = document.querySelector(':root')
    if (root) {
      const variables = {
        '--w3m-color-av-1': colors[0],
        '--w3m-color-av-2': colors[1],
        '--w3m-color-av-3': colors[2],
        '--w3m-color-av-4': colors[3],
        '--w3m-color-av-5': colors[4]
      }
      Object.entries(variables).forEach(([key, val]) => root.style.setProperty(key, val))
    }
  },

  setRecentWallet(wallet: WalletRouteData) {
    const { walletConnectVersion } = OptionsCtrl.state
    localStorage.setItem(
      UiUtil.W3M_RECENT_WALLET_DATA,
      JSON.stringify({ [walletConnectVersion]: wallet })
    )
  },

  getRecentWallet() {
    const wallet = localStorage.getItem(UiUtil.W3M_RECENT_WALLET_DATA)
    if (wallet) {
      const { walletConnectVersion } = OptionsCtrl.state
      const json = JSON.parse(wallet)
      if (json[walletConnectVersion]) {
        return json[walletConnectVersion] as WalletRouteData
      }
    }

    return undefined
  },

  getExtensionWallets() {
    const wallets = []
    for (const [key, value] of Object.entries(EthereumPresets.injectedPreset)) {
      if (value?.isInjected && !value.isDesktop) {
        wallets.push({ id: key, ...value })
      }
    }

    return wallets
  },

  caseSafeIncludes(str1: string, str2: string) {
    return str1.toUpperCase().includes(str2.toUpperCase())
  },

  openWalletExplorerUrl() {
    CoreUtil.openHref(UiUtil.EXPLORER_WALLET_URL, '_blank')
  }
}
