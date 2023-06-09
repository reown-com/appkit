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
      params: ['0x48656c6c6f20576562334d6f64616c', account]
    }
  }
}

export function DEMO_SIGN_TYPED_DATA_REQUEST(chainId?: number) {
  return {
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
      ]
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
      },
      contents: 'Hello, Bob!'
    },
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: chainId ?? 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    },
    primaryType: 'Mail'
  } as const
}
