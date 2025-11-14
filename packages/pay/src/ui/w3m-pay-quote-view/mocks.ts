export const PAYMENT_OPTIONS = [
  // USDC tokens
  {
    network: 'eip155:8453',
    asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
    },
    amount: 100
  },
  {
    network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
    },
    amount: 100
  },
  {
    network: 'eip155:10',
    asset: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
    },
    amount: 100
  },
  {
    network: 'eip155:1',
    asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
    },
    amount: 100
  },
  // USDT tokens
  {
    network: 'eip155:1',
    asset: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6
    },
    amount: 100
  },
  {
    network: 'eip155:10',
    asset: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6
    },
    amount: 100
  },
  // DAI tokens
  {
    network: 'eip155:1',
    asset: '0x6b175474e89094c44da98b954eedeac495271d0f',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/39807/large/dai.png',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18
    },
    amount: 100
  },
  {
    network: 'eip155:8453',
    asset: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/39807/large/dai.png',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18
    },
    amount: 100
  },
  {
    network: 'eip155:10',
    asset: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    metadata: {
      logoURI: 'https://coin-images.coingecko.com/coins/images/39807/large/dai.png',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18
    },
    amount: 100
  },
  // Native tokens
  {
    network: 'bip122:000000000019d6689c085ae165831e93',
    asset: 'bc1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmql8k8',
    metadata: {
      logoURI: 'https://assets.relay.link/icons/currencies/btc.png',
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8
    },
    amount: 100
  },
  {
    network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    asset: '11111111111111111111111111111111',
    metadata: {
      logoURI: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png',
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9
    },
    amount: 100
  }
] as const
