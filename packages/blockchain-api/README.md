# @reown/blockchain-api

A client library for interacting with the WalletConnect Blockchain API.

## Installation

```bash
npm install @reown/blockchain-api
```

## Usage

### Basic Usage

```typescript
import { BlockchainApiClient } from '@reown/blockchain-api'

// Create a client
const client = new BlockchainApiClient({
  projectId: 'YOUR_PROJECT_ID',
  sdkType: 'web-app',
  sdkVersion: '1.0.0'
})

// Get supported networks
const supportedNetworks = await client.getSupportedNetworks()

// Get account balance
const balance = await client.getBalance('0x123...', '1') // address, chainId
```

### Advanced Configuration

You can configure the client with additional options:

```typescript
import { BLOCKCHAIN_API_URL, BlockchainApiClient } from '@reown/blockchain-api'

const client = new BlockchainApiClient({
  baseUrl: BLOCKCHAIN_API_URL, // Defaults to 'https://rpc.walletconnect.org'
  projectId: 'YOUR_PROJECT_ID',
  clientId: 'YOUR_CLIENT_ID', // Optional
  sdkType: 'web-app',
  sdkVersion: '1.0.0'
})

// Update configuration later
client.setProjectId('NEW_PROJECT_ID')
client.setClientId('NEW_CLIENT_ID')
client.setSdkType('mobile-app')
client.setSdkVersion('1.1.0')
```

## Features

### Account Information

```typescript
// Get account identity
const identity = await client.fetchIdentity({
  address: '0x123...',
  caipNetworkId: 'eip155:1',
  sender: '0x456...' // Optional
})

// Get account transactions
const transactions = await client.fetchTransactions({
  account: '0x123...',
  chainId: '1',
  cursor: 'next_page_cursor' // Optional, for pagination
})

// Get account balance
const balance = await client.getBalance('0x123...', '1')
```

### Token Swaps

```typescript
// Get available tokens for swapping
const tokens = await client.fetchSwapTokens({ chainId: '1' })

// Get token prices
const prices = await client.fetchTokenPrice({
  addresses: ['0x123...', '0x456...']
})

// Get swap quote
const quote = await client.fetchSwapQuote({
  amount: '1000000000000000000', // 1 ETH in wei
  userAddress: '0x123...',
  from: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
  to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
})

// Check token allowance
const allowance = await client.fetchSwapAllowance({
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  userAddress: '0x123...'
})

// Generate approve calldata
const approveCalldata = await client.generateApproveCalldata({
  userAddress: '0x123...',
  from: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  to: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
})

// Generate swap calldata
const swapCalldata = await client.generateSwapCalldata({
  amount: '1000000000000000000',
  userAddress: '0x123...',
  from: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
})
```

### ENS

```typescript
// Lookup ENS name
const ensInfo = await client.lookupEnsName('vitalik.eth')

// Reverse lookup ENS name
const ensNames = await client.reverseLookupEnsName({
  address: '0x123...',
  sender: '0x456...' // Optional
})

// Get name suggestions
const suggestions = await client.getEnsNameSuggestions('vitalik')

// Register ENS name
const registration = await client.registerEnsName({
  coinType: 60, // ETH
  address: '0x123...',
  message: 'Message to sign',
  signature: '0x456...'
})
```

### On-ramp

```typescript
// Get on-ramp options
const options = await client.getOnrampOptions()

// Get on-ramp quote
const quote = await client.getOnrampQuote({
  purchaseCurrency: { id: 'ETH', symbol: 'ETH' },
  paymentCurrency: { id: 'USD' },
  amount: '100',
  network: 'ethereum'
})

// Generate on-ramp URL
const url = await client.generateOnRampURL({
  destinationWallets: [{ address: '0x123...', blockchains: ['ethereum'] }],
  partnerUserId: 'user123',
  defaultNetwork: 'ethereum',
  purchaseAmount: '0.1', // Optional
  paymentAmount: '100' // Optional
})
```

### Smart Sessions

```typescript
// Get smart sessions
const sessions = await client.getSmartSessions('eip155:1:0x123...')

// Revoke smart session
const revocation = await client.revokeSmartSession('0x123...', 'pci_value', 'signature_value')
```

## Utility Functions

```typescript
import {
  formatAddress,
  formatCaipAddress,
  getChainIdFromCaipAddress,
  getPlainAddress
} from '@reown/blockchain-api'

// Extract plain address from CAIP format
const address = getPlainAddress('eip155:1:0x123...')
// Result: '0x123...'

// Get chain ID from CAIP address
const chainId = getChainIdFromCaipAddress('eip155:1:0x123...')
// Result: '1'

// Format CAIP address
const caipAddress = formatCaipAddress('0x123...', 'eip155', '1')
// Result: 'eip155:1:0x123...'

// Format address for display
const displayAddress = formatAddress('0x1234567890abcdef1234567890abcdef12345678')
// Result: '0x1234...5678'
```

## License

MIT
