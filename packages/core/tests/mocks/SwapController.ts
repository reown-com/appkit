export const tokensResponse = [
  {
    name: 'Matic Token',
    symbol: 'MATIC',
    address:
      'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as `${string}:${string}:${string}`,
    value: 15.945686877137186,
    price: 0.6990173876,
    decimals: 18,
    quantity: {
      numeric: '22.811574018044047908',
      decimals: '18'
    },
    logoUri: 'https://token-icons.s3.amazonaws.com/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png'
  },
  {
    name: 'ShapeShift FOX',
    symbol: 'FOX',
    address:
      'eip155:137:0x65a05db8322701724c197af82c9cae41195b0aa8' as `${string}:${string}:${string}`,
    value: 0.818151429070586,
    price: 0.10315220553291868,
    decimals: 18,
    quantity: {
      numeric: '9.348572710146769370',
      decimals: '18'
    },
    logoUri: 'https://token-icons.s3.amazonaws.com/0xc770eefad204b5180df6a14ee197d99d808ee52d.png'
  },
  {
    name: 'Tether USD',
    symbol: 'USDT',
    address:
      'eip155:137:0xc2132d05d31c914a87c6611c10748aeb04b58e8f' as `${string}:${string}:${string}`,
    value: 0.8888156632489365,
    price: 0.9995840116762155,
    decimals: 6,
    quantity: {
      numeric: '0.888765',
      decimals: '6'
    },
    logoUri: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png'
  }
]

export const networkTokenPriceResponse = {
  fungibles: [
    {
      name: 'Matic Token',
      symbol: 'MATIC',
      price: '0.6990173876',
      iconUrl: 'https://token-icons.s3.amazonaws.com/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png'
    }
  ]
}

export const balanceResponse = {
  balances: [
    {
      name: 'Matic Token',
      symbol: 'MATIC',
      chainId: 'eip155:137',
      value: 10.667935172031754,
      price: 0.7394130944,
      quantity: {
        decimals: '18',
        numeric: '14.427571343848456409'
      },
      iconUrl: 'https://token-icons.s3.amazonaws.com/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png'
    },
    {
      name: 'Wrapped AVAX',
      symbol: 'AVAX',
      chainId: 'eip155:137',
      address: 'eip155:137:0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b',
      value: 3.751852120639868,
      price: 38.0742530944,
      quantity: {
        decimals: '18',
        numeric: '0.098540399764051957'
      },
      iconUrl: 'https://token-icons.s3.amazonaws.com/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png'
    },
    {
      name: 'Tether USD',
      symbol: 'USDT',
      chainId: 'eip155:137',
      address: 'eip155:137:0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      value: 2.3040319252130432,
      price: 1.0010962048,
      quantity: {
        decimals: '6',
        numeric: '2.301509'
      },
      iconUrl: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png'
    }
  ]
}

export const gasPriceResponse = {
  standard: '60000000128',
  fast: '150000000128',
  instant: '195000000166'
}
