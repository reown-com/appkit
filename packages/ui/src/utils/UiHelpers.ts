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
import {
  getChainPresetExplorerImage,
  getOptimisticNamePreset,
  getWalletPresetExplorerImage
} from './Presets'

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
  const { fallback, presets } = getWalletPresetExplorerImage()
  const imageId = presets[id]
  const { projectId, walletImages } = ConfigCtrl.state

  return walletImages?.[id] ?? (projectId ? ExplorerCtrl.getImageUrl(imageId ?? fallback) : '')
}

export function getChainIcon(chainId: number) {
  const { fallback, presets } = getChainPresetExplorerImage()
  const { projectId, chainImages } = ConfigCtrl.state

  return (
    chainImages?.[chainId] ??
    (projectId ? ExplorerCtrl.getImageUrl(presets[chainId] ?? fallback) : '')
  )
}

export function getWalletFirstName(fullName: string) {
  const optimisticName = getOptimisticNamePreset(fullName)

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
  links: { deep?: string; universal?: string },
  name: string
) {
  const { standaloneUri, selectedChainId } = OptionsCtrl.state
  const { deep, universal } = links

  function onRedirect(uri: string) {
    let href = ''
    if (universal) {
      href = CoreHelpers.formatUniversalUrl(universal, uri, name)
    } else if (deep) {
      CoreHelpers.formatNativeUrl(deep, uri, name)
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
