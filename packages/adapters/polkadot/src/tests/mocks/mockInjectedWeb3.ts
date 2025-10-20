export function installInjectedWeb3() {
  ;(window as any).injectedWeb3 = {
    'polkadot-js': { name: 'polkadot-js', version: '1.0.0', enable: vi.fn() },
    talisman: { name: 'talisman', version: '1.2.3', enable: vi.fn() },
    'subwallet-js': { name: 'subwallet', version: '0.9.8', enable: vi.fn() }
  }
}
