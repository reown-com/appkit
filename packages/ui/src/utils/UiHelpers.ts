import {
  ClientCtrl,
  ConfigCtrl,
  CoreHelpers,
  ExplorerCtrl,
  ModalCtrl,
  OptionsCtrl,
  ToastCtrl
} from '@web3modal/core'
import type { LitElement } from 'lit'
import { PresetUtil } from './PresetUtil'

export const MOBILE_BREAKPOINT = 600

export function getShadowRootElement(root: LitElement, selector: string) {
  const el = root.renderRoot.querySelector(selector)
  if (!el) {
    throw new Error(`${selector} not found`)
  }

  return el
}

export function getConditionalValue<T extends string>(
  value: T | T[],
  condition: boolean[] | boolean
) {
  if (typeof value === 'string' && typeof condition === 'boolean' && condition) {
    return value
  } else if (Array.isArray(value) && Array.isArray(condition)) {
    const index = condition.findIndex(c => c)
    if (index < 0) {
      throw new Error('No matching value')
    }

    return value[index]
  }

  throw new Error('Invalid useConditionalClass arguments')
}

export function getWalletIcon(id: string) {
  const { fallback, presets } = PresetUtil.walletExplorerImage()
  const imageId = presets[id]
  const { projectId, walletImages } = ConfigCtrl.state

  return walletImages?.[id] ?? (projectId ? ExplorerCtrl.getImageUrl(imageId ?? fallback) : '')
}

export function getChainIcon(chainId: number | string) {
  const { fallback, presets } = PresetUtil.chainExplorerImage()
  const { projectId, chainImages } = ConfigCtrl.state

  return (
    chainImages?.[chainId] ??
    (projectId ? ExplorerCtrl.getImageUrl(presets[chainId] ?? fallback) : '')
  )
}

export function getWalletFirstName(fullName: string) {
  const optimisticName = PresetUtil.optimisticName(fullName)

  return optimisticName.split(' ')[0] ?? optimisticName
}

export function isMobileAnimation() {
  return window.innerWidth <= MOBILE_BREAKPOINT
}

export async function preloadImage(src: string) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = resolve
    image.onerror = reject
    image.src = src
  })
}

export function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Unknown Error'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce(func: (...args: any[]) => unknown, timeout = 500) {
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
}

export async function handleMobileLinking(
  links: { native?: string; universal?: string },
  name: string
) {
  const { standaloneUri, selectedChainId } = OptionsCtrl.state
  const { native, universal } = links

  function onRedirect(uri: string) {
    let href = ''
    if (universal) {
      href = CoreHelpers.formatUniversalUrl(universal, uri, name)
    } else if (native) {
      CoreHelpers.formatNativeUrl(native, uri, name)
    }
    CoreHelpers.openHref(href)
  }

  if (standaloneUri) {
    onRedirect(standaloneUri)
  } else {
    await ClientCtrl.client().connectWalletConnect(uri => {
      onRedirect(uri)
    }, selectedChainId)
    ModalCtrl.close()
  }
}

export async function handleUriCopy() {
  const { standaloneUri } = OptionsCtrl.state
  if (standaloneUri) {
    await navigator.clipboard.writeText(standaloneUri)
  } else {
    const uri = await ClientCtrl.client().getActiveWalletConnectUri()
    await navigator.clipboard.writeText(uri)
  }
  ToastCtrl.openToast('Link copied', 'success')
}

export function getCustomWallets() {
  const { desktopWallets, mobileWallets } = ConfigCtrl.state

  return (CoreHelpers.isMobile() ? mobileWallets : desktopWallets) ?? []
}

export function getCustomImageUrls() {
  const { chainImages, walletImages } = ConfigCtrl.state
  const chainUrls = Object.values(chainImages ?? {})
  const walletUrls = Object.values(walletImages ?? {})

  return Object.values([...chainUrls, ...walletUrls])
}

export function getConnectorImageUrls() {
  const connectors = ClientCtrl.client().getConnectorWallets()
  const ids = connectors.map(({ id }) => PresetUtil.optimisticWalletId(id))
  const images = ids.map(id => getWalletIcon(id))

  return images
}

export function truncate(value: string, strLen = 8) {
  if (value.length <= strLen) {
    return value
  }

  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
}
