export const networkImages = {
  // Ethereum
  1: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
  // Arbitrum
  42161: '3bff954d-5cb0-47a0-9a23-d20192e74600',
  // Avalanche
  43114: '30c46e53-e989-45fb-4549-be3bd4eb3b00',
  // Binance Smart Chain
  56: '93564157-2e8e-4ce7-81df-b264dbee9b00',
  // Optimism
  10: 'ab9c186a-c52f-464b-2906-ca59d760a400',
  // Polygon
  137: '41d04d42-da3b-4453-8506-668cc0727900',
  // ZkSync
  324: 'b310f07f-4ef7-49f3-7073-2a0a39685800',
  // Base
  8453: '7289c336-3981-4081-c5f4-efc26ac64a00',
  // Solana
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'a1b58899-f671-4276-6a5e-56ca5bd59700',
  // Solana Testnet
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1: 'ae542fcd-69e0-402c-7369-dcbad393ba00',
  // Bitcoin
  '000000000019d6689c085ae165831e93': '0b4838db-0161-4ffe-022d-532bf03dba00',
  // Bitcoin Testnet
  '000000000933ea01ad0ee984209779ba': '39354064-d79b-420b-065d-f980c4b78200'
}

export const chainImages = {
  eip155: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
  solana: 'a1b58899-f671-4276-6a5e-56ca5bd59700',
  bip122: '0b4838db-0161-4ffe-022d-532bf03dba00'
}

export function getImageDeliveryURL(imageId: string) {
  return `https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/${imageId}/sm`
}
