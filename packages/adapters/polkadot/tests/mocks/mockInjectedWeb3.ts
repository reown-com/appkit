/**
 * Mock window.injectedWeb3 for testing
 * Simulates Polkadot wallet extensions being installed
 */

/**
 * Mock extension entry in window.injectedWeb3
 */
interface MockExtensionEntry {
  enable: (appName: string) => Promise<any>
  version: string
}

/**
 * Setup window.injectedWeb3 with specified extensions
 */
export function setupMockInjectedWeb3(extensions: string[] = ['subwallet-js', 'talisman', 'polkadot-js']) {
  if (typeof window === 'undefined') {
    throw new Error('setupMockInjectedWeb3 can only be called in browser environment')
  }

  const injectedWeb3: Record<string, MockExtensionEntry> = {}

  extensions.forEach(ext => {
    injectedWeb3[ext] = {
      enable: async (appName: string) => {
        console.log(`[MockInjectedWeb3] ${ext}.enable called with:`, appName)
        return {
          name: ext,
          version: '1.0.0',
          accounts: {
            get: async () => []
          },
          signer: {}
        }
      },
      version: '1.0.0'
    }
  })

  ;(window as any).injectedWeb3 = injectedWeb3
  console.log('[MockInjectedWeb3] Setup with extensions:', extensions)
}

/**
 * Clear window.injectedWeb3
 */
export function clearMockInjectedWeb3() {
  if (typeof window !== 'undefined') {
    delete (window as any).injectedWeb3
    console.log('[MockInjectedWeb3] Cleared')
  }
}

/**
 * Check if extension is installed
 */
export function isMockExtensionInstalled(extension: string): boolean {
  if (typeof window === 'undefined') return false
  const injectedWeb3 = (window as any).injectedWeb3
  return injectedWeb3 && !!injectedWeb3[extension]
}

