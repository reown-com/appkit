export const DEMO_METADATA = {
  name: 'Web3Modal Lab',
  description: 'Web3Modal Laboratory',
  url: 'lab.web3modal.com',
  icons: ['https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg']
}

export const DEMO_NAMESPACE = {
  requiredNamespaces: {
    eip155: {
      methods: ['eth_sendTransaction', 'personal_sign'],
      chains: ['eip155:1'],
      events: ['chainChanged', 'accountsChanged']
    }
  }
}

export const DEMO_STATEMENT = { statement: 'Connect to Web3Modal Lab' }

export function DEMO_SIGN_REQUEST(topic: string, account: string) {
  return {
    topic,
    chainId: 'eip155:1',
    request: {
      method: 'personal_sign',
      params: ['0xdeadbeaf', account]
    }
  }
}
