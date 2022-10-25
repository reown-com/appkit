import { CoreHelpers, getExplorerApi } from '@web3modal/core'
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

export function getWalletIcon(name: string) {
  const { projectId, url } = getExplorerApi()
  const cdn = `${url}/v2/logo/lg`
  const fallback = '09a83110-5fc3-45e1-65ab-8f7df2d6a400'
  const presets: Record<string, string | undefined> = {
    'Brave Wallet': '125e828e-9936-4451-a8f2-949c119b7400',
    MetaMask: '619537c0-2ff3-4c78-9ed8-a05e7567f300',
    'Coinbase Wallet': 'f8068a7f-83d7-4190-1f94-78154a12c600',
    'Ledger Live': '39890ad8-5b2e-4df6-5db4-2ff5cf4bb300',
    Exodus: '4c16cad4-cac9-4643-6726-c696efaf5200'
  }

  return `${cdn}/${presets[name] ?? fallback}?projectId=${projectId}`
}

export function getChainIcon(chainId: number) {
  const { projectId, url } = getExplorerApi()
  const cdn = `${url}/v2/logo/lg`
  const fallback = 'ec6b76f3-cf2d-4c3b-56e3-f93b1133e400'
  const presets: Record<string, string | undefined> = {
    // Arbitrum
    42161: 'f590e3dc-b0f1-471c-19be-03fb34e2c200',
    // Arbitrum Goerli
    421613: 'f590e3dc-b0f1-471c-19be-03fb34e2c200',
    // Arbitrum Rinkeby
    421611: 'f590e3dc-b0f1-471c-19be-03fb34e2c200',
    // Avalanche
    43114: fallback,
    // Avalanche Fuji
    43113: fallback,
    // Binance Smart Chain
    56: fallback,
    // Binance Smart Testnet
    97: fallback,
    // Fantom
    250: fallback,
    // Fantom Testnet
    4002: fallback,
    // Ethereum Goerli Testnet
    5: 'ec6b76f3-cf2d-4c3b-56e3-f93b1133e400',
    // Ethereum Kovan Testnet
    42: 'ec6b76f3-cf2d-4c3b-56e3-f93b1133e400',
    // Ethereum Rinkeby Testnet
    4: 'ec6b76f3-cf2d-4c3b-56e3-f93b1133e400',
    // Ethereum Ropsten Testnet
    3: 'ec6b76f3-cf2d-4c3b-56e3-f93b1133e400',
    // Ethereum Sepolia Testnet
    11155111: 'ec6b76f3-cf2d-4c3b-56e3-f93b1133e400',
    // Ethereum
    1: 'ec6b76f3-cf2d-4c3b-56e3-f93b1133e400',
    // Optimism
    10: '63888573-0c6d-4f93-0ab6-8f6387a34700',
    // Optimism Goerli Testnet
    420: '63888573-0c6d-4f93-0ab6-8f6387a34700',
    // Optimism Kovan Testnet
    69: '63888573-0c6d-4f93-0ab6-8f6387a34700',
    // Polygon
    137: 'c32c5f19-d04d-46b1-12da-fad0cb463400',
    // Polygon Mumbai Testnet
    80001: 'c32c5f19-d04d-46b1-12da-fad0cb463400'
  }

  return `${cdn}/${presets[chainId] ?? fallback}?projectId=${projectId}`
}

export function getWalletFirstName(fullName: string) {
  return fullName.split(' ')[0] ?? fullName
}

export function getDefaultWalletNames() {
  return CoreHelpers.isMobile()
    ? ['Coinbase Wallet']
    : ['MetaMask', 'Coinbase Wallet', 'Ledger Live', 'Brave Wallet']
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
