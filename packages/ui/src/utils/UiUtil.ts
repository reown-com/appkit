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
import { PresetUtil } from './PresetUtil'

export const UiUtil = {
  MOBILE_BREAKPOINT: 600,

  getShadowRootElement(root: LitElement, selector: string) {
    const el = root.renderRoot.querySelector(selector)
    if (!el) {
      throw new Error(`${selector} not found`)
    }

    return el
  },

  getWalletIcon(id: string) {
    const { fallback, presets } = PresetUtil.walletExplorerImage()
    const imageId = presets[id]
    const { projectId, walletImages } = ConfigCtrl.state

    return walletImages?.[id] ?? (projectId ? ExplorerCtrl.getImageUrl(imageId ?? fallback) : '')
  },

  getChainIcon(chainId: number | string) {
    const { fallback, presets } = PresetUtil.chainExplorerImage()
    const { projectId, chainImages } = ConfigCtrl.state

    return (
      chainImages?.[chainId] ??
      (projectId ? ExplorerCtrl.getImageUrl(presets[chainId] ?? fallback) : '')
    )
  },

  getWalletFirstName(fullName: string) {
    const optimisticName = PresetUtil.optimisticName(fullName)

    return optimisticName.split(' ')[0] ?? optimisticName
  },

  isMobileAnimation() {
    return window.innerWidth <= UiUtil.MOBILE_BREAKPOINT
  },

  async preloadImage(src: string) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = resolve
      image.onerror = reject
      image.src = src
    })
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

  async handleMobileLinking(links: { native?: string; universal?: string }, name: string) {
    const { standaloneUri, selectedChainId } = OptionsCtrl.state
    const { native, universal } = links

    function onRedirect(uri: string) {
      let href = ''
      if (universal) {
        href = CoreUtil.formatUniversalUrl(universal, uri, name)
      } else if (native) {
        href = CoreUtil.formatNativeUrl(native, uri, name)
      }
      CoreUtil.openHref(href)
    }

    if (standaloneUri) {
      onRedirect(standaloneUri)
    } else {
      await ClientCtrl.client().connectWalletConnect(uri => {
        onRedirect(uri)
      }, selectedChainId)
      ModalCtrl.close()
    }
  },

  async handleUriCopy() {
    const { standaloneUri } = OptionsCtrl.state
    if (standaloneUri) {
      await navigator.clipboard.writeText(standaloneUri)
    } else {
      const uri = await ClientCtrl.client().getActiveWalletConnectUri()
      await navigator.clipboard.writeText(uri)
    }
    ToastCtrl.openToast('Link copied', 'success')
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
    const connectors = ClientCtrl.client().getConnectorWallets()
    const ids = connectors.map(({ id }) => PresetUtil.optimisticWalletId(id))
    const images = ids.map(id => UiUtil.getWalletIcon(id))

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
        '--color-av-1': colors[0],
        '--color-av-2': colors[1],
        '--color-av-3': colors[2],
        '--color-av-4': colors[3],
        '--color-av-5': colors[4]
      }
      Object.entries(variables).forEach(([key, val]) => root.style.setProperty(key, val))
    }
  }
}
