import {
  ClientCtrl,
  CoreHelpers,
  getExplorerApi,
  ModalCtrl,
  OptionsCtrl,
  ToastCtrl
} from '@web3modal/core'
import type { LitElement } from 'lit'

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
  const { projectId, url } = getExplorerApi()
  const cdn = `${url}/v2/logo/lg`
  const fallback = '09a83110-5fc3-45e1-65ab-8f7df2d6a400'

  const presets: Record<string, string | undefined> = {
    Brave: '125e828e-9936-4451-a8f2-949c119b7400',
    MetaMask: '619537c0-2ff3-4c78-9ed8-a05e7567f300',
    Coinbase: 'f8068a7f-83d7-4190-1f94-78154a12c600',
    Ledger: '39890ad8-5b2e-4df6-5db4-2ff5cf4bb300',
    Exodus: '4c16cad4-cac9-4643-6726-c696efaf5200',
    Trust: '0528ee7e-16d1-4089-21e3-bbfb41933100',
    Core: '35f9c46e-cc57-4aa7-315d-e6ccb2a1d600',
    BitKeep: '3f7075d0-4ab7-4db5-404d-3e4c05e6fe00',
    MathWallet: '26a8f588-3231-4411-60ce-5bb6b805a700',
    Opera: '877fa1a4-304d-4d45-ca8e-f76d1a556f00',
    TokenPocket: 'f3119826-4ef5-4d31-4789-d4ae5c18e400',
    Tokenary: '5e481041-dc3c-4a81-373a-76bbde91b800',
    '1inch': 'dce1ee99-403f-44a9-9f94-20de30616500'
  }

  const optimisticName = getOptimisticName(name)
  const preset = Object.keys(presets).find(key => compareTwoStrings(key, optimisticName) >= 0.5)
  const imageId = preset ? presets[preset] : undefined

  return `${cdn}/${imageId ?? fallback}?projectId=${projectId}`
}

export function getChainIcon(chainId: number) {
  const { projectId, url } = getExplorerApi()
  const cdn = `${url}/v2/logo/lg`
  const fallback = '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400'
  const presets: Record<string, string | undefined> = {
    // Arbitrum
    42161: '600a9a04-c1b9-42ca-6785-9b4b6ff85200',
    // Arbitrum Goerli
    421613: '600a9a04-c1b9-42ca-6785-9b4b6ff85200',
    // Arbitrum Rinkeby
    421611: '600a9a04-c1b9-42ca-6785-9b4b6ff85200',
    // Avalanche
    43114: '30c46e53-e989-45fb-4549-be3bd4eb3b00',
    // Avalanche Fuji
    43113: '30c46e53-e989-45fb-4549-be3bd4eb3b00',
    // Binance Smart Chain
    56: '93564157-2e8e-4ce7-81df-b264dbee9b00',
    // Binance Smart Testnet
    97: '93564157-2e8e-4ce7-81df-b264dbee9b00',
    // Fantom
    250: '06b26297-fe0c-4733-5d6b-ffa5498aac00',
    // Fantom Testnet
    4002: '06b26297-fe0c-4733-5d6b-ffa5498aac00',
    // Ethereum Goerli Testnet
    5: '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400',
    // Ethereum Kovan Testnet
    42: '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400',
    // Ethereum Rinkeby Testnet
    4: '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400',
    // Ethereum Ropsten Testnet
    3: '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400',
    // Ethereum Sepolia Testnet
    11155111: '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400',
    // Ethereum
    1: '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400',
    // Optimism
    10: 'ab9c186a-c52f-464b-2906-ca59d760a400',
    // Optimism Goerli Testnet
    420: 'ab9c186a-c52f-464b-2906-ca59d760a400',
    // Optimism Kovan Testnet
    69: 'ab9c186a-c52f-464b-2906-ca59d760a400',
    // Polygon
    137: '41d04d42-da3b-4453-8506-668cc0727900',
    // Polygon Mumbai Testnet
    80001: '41d04d42-da3b-4453-8506-668cc0727900'
  }

  return `${cdn}/${presets[chainId] ?? fallback}?projectId=${projectId}`
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
