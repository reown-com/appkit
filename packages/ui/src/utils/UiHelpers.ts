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
import { getCloudChainImages, getCloudWalletImages } from './Images'

export const MOBILE_BREAKPOINT = 600

export function getShadowRootElement(root: LitElement, selector: string) {
  const el = root.renderRoot.querySelector(selector)
  if (!el) throw new Error(`${selector} not found`)

  return el
}

export function getConditionalValue<T extends string>(
  value: T | T[],
  condition: boolean[] | boolean
) {
  if (typeof value === 'string' && typeof condition === 'boolean' && condition) return value
  else if (Array.isArray(value) && Array.isArray(condition)) {
    const index = condition.findIndex(c => c)
    if (index < 0) throw new Error('No matching value')

    return value[index]
  }

  throw new Error('Invalid useConditionalClass arguments')
}

/**
 * Compares similarity between 2 strings and returns value from 0 to 1
 * https://github.com/aceakash/string-similarity/blob/master/src/index.js
 */
export function compareTwoStrings(first: string, second: string) {
  const parsedFirst = first.replace(/\s+/u, '')
  const parsedSecond = second.replace(/\s+/u, '')

  if (parsedFirst === parsedSecond) return 1
  if (parsedFirst.length < 2 || parsedSecond.length < 2) return 0

  const firstBigrams = new Map<string, number>()
  for (let i = 0; i < parsedFirst.length - 1; i += 1) {
    const bigram = parsedFirst.substring(i, i + 2)
    const storedBigram = firstBigrams.get(bigram)
    const count = typeof storedBigram === 'number' ? storedBigram + 1 : 1
    firstBigrams.set(bigram, count)
  }

  let intersectionSize = 0
  for (let i = 0; i < parsedSecond.length - 1; i += 1) {
    const bigram = parsedSecond.substring(i, i + 2)
    const storedBigram = firstBigrams.get(bigram)
    const count = typeof storedBigram === 'number' ? storedBigram : 0
    if (count > 0) {
      firstBigrams.set(bigram, count - 1)
      intersectionSize += 1
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2)
}

export function getOptimisticName(name: string) {
  if (name.toUpperCase() !== 'INJECTED') return name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { ethereum }: { ethereum?: any } = window
  if (!ethereum) return 'Unknown'
  if (ethereum.isFrame) return 'Frame'
  if (ethereum.isPortal) return 'Ripio Portal'
  if (ethereum.isTally) return 'Tally'
  if (ethereum.isTrust || ethereum.isTrustWallet) return 'Trust'
  if (ethereum.isCoinbaseExtension) return 'Coinbase'
  if (ethereum.isAvalanche) return 'Core'
  if (ethereum.isBitKeep) return 'BitKeep'
  if (ethereum.isBraveWallet) return 'Brave'
  if (ethereum.isExodus) return 'Exodus'
  if (ethereum.isMathWallet) return 'MathWallet'
  if (ethereum.isOpera) return 'Opera'
  if (ethereum.isTokenPocket) return 'TokenPocket'
  if (ethereum.isTokenary) return 'Tokenary'
  if (ethereum.isMetaMask) return 'MetaMask'

  return 'Injected'
}

export function getWalletIcon(name: string) {
  const { fallback, presets } = getCloudWalletImages()
  const optimisticName = getOptimisticName(name)
  const preset = Object.keys(presets).find(key => compareTwoStrings(key, optimisticName) >= 0.5)
  const imageId = preset ? presets[preset] : undefined
  const { projectId } = ConfigCtrl.state

  return projectId ? ExplorerCtrl.getImageUrl(imageId ?? fallback) : ''
}

export function getChainIcon(chainId: number) {
  const { fallback, presets } = getCloudChainImages()
  const { projectId } = ConfigCtrl.state

  return projectId ? ExplorerCtrl.getImageUrl(presets[chainId] ?? fallback) : ''
}

export function getWalletFirstName(fullName: string) {
  const optimisticName = getOptimisticName(fullName)

  return optimisticName.split(' ')[0] ?? optimisticName
}

export function getDefaultWalletNames() {
  return CoreHelpers.isMobile()
    ? ['Coinbase Wallet']
    : ['MetaMask', 'Coinbase Wallet', 'Ledger Live']
}

export function defaultWalletImages() {
  return getDefaultWalletNames().map(name => getWalletIcon(name))
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

    if (timer) clearTimeout(timer)

    timer = setTimeout(next, timeout)
  }
}

export async function handleMobileLinking(
  links: { native: string; universal?: string },
  name: string
) {
  const { standaloneUri, selectedChainId } = OptionsCtrl.state
  const { native, universal } = links

  function onRedirect(uri: string) {
    const href = universal
      ? CoreHelpers.formatUniversalUrl(universal, uri, name)
      : CoreHelpers.formatNativeUrl(native, uri, name)
    CoreHelpers.openHref(href)
  }

  if (standaloneUri) onRedirect(standaloneUri)
  else {
    const connector = ClientCtrl.client().getConnectorById('injected')
    const isNameSimilar = compareTwoStrings(name, connector.name) >= 0.5
    if (connector.ready && isNameSimilar)
      await ClientCtrl.client().connectExtension('injected', selectedChainId)
    else
      await ClientCtrl.client().connectWalletConnect(uri => {
        onRedirect(uri)
      }, selectedChainId)
    ModalCtrl.close()
  }
}

export async function handleUriCopy() {
  const { standaloneUri } = OptionsCtrl.state
  if (standaloneUri) await navigator.clipboard.writeText(standaloneUri)
  else {
    const uri = await ClientCtrl.client().getActiveWalletConnectUri()
    await navigator.clipboard.writeText(uri)
  }
  ToastCtrl.openToast('Link copied', 'success')
}
