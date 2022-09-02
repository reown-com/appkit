import type { LitElement } from 'lit'

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

export function getWalletIcon(name: string, size: 'lg' | 'md' | 'sm' = 'md') {
  const cdn = 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA'
  const fallback = '09a83110-5fc3-45e1-65ab-8f7df2d6a400'
  const presets: Record<string, string | undefined> = {
    'Brave Wallet': '125e828e-9936-4451-a8f2-949c119b7400',
    MetaMask: '619537c0-2ff3-4c78-9ed8-a05e7567f300',
    Coinbase: 'f8068a7f-83d7-4190-1f94-78154a12c600',
    Ledger: '39890ad8-5b2e-4df6-5db4-2ff5cf4bb300'
  }

  return `${cdn}/${presets[name] ?? fallback}/${size}`
}
