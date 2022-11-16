export function getCloudWalletImages() {
  const fallback = '09a83110-5fc3-45e1-65ab-8f7df2d6a400'
  const presets = {
    _fallback: '09a83110-5fc3-45e1-65ab-8f7df2d6a400',
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
  } as Record<string, string | undefined>

  return { fallback, presets }
}

export function getCloudChainImages() {
  const fallback = '58d8f4c8-cf51-4a82-5ce5-56d8a4d24400'
  const presets = {
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
  } as Record<string, string | undefined>

  return { fallback, presets }
}
