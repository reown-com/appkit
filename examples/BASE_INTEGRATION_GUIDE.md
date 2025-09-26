# Base Network Integration Guide for Reown AppKit

## Quick Start: Base + AppKit

This guide demonstrates how to integrate Base network with Reown AppKit (formerly WalletConnect), with production examples and optimizations.

## Why Base + AppKit?

- **Coinbase Wallet Integration**: Seamless connection for millions of Coinbase users
- **L2 Optimization**: Low fees perfect for wallet interactions
- **Growing Ecosystem**: Rapid adoption of Base network
- **Cross-Wallet Support**: Connect MetaMask, Rainbow, Coinbase Wallet, and more

## Basic Integration

### 1. Installation

```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi wagmi viem @tanstack/react-query
```

### 2. Configuration with Base

```typescript
import { createAppKit } from '@reown/appkit/react'
import { base, baseSepolia } from 'viem/chains'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { coinbaseWallet, walletConnect, metaMask } from 'wagmi/connectors'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'

// 2. Configure wagmi with Base
const metadata = {
  name: 'Base DeFi App',
  description: 'DeFi on Base with AppKit',
  url: 'https://yourapp.base.eth',
  icons: ['https://yourapp.base.eth/logo.png']
}

const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org')
  },
  connectors: [
    walletConnect({ projectId, metadata }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    }),
    metaMask()
  ]
})

// 3. Create AppKit instance
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base, baseSepolia],
  defaultNetwork: base,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'discord'],
    emailShowWallets: true
  }
})
```

## Production Example: FractionalAssets Integration

Based on the deployed FractionalAssets protocol ([0xBe49c093E87B400BF4f9732B88a207747b3b830a](https://basescan.org/address/0xBe49c093E87B400BF4f9732B88a207747b3b830a)):

```tsx
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther } from 'viem'

const FRACTIONAL_ASSETS_ADDRESS = '0xBe49c093E87B400BF4f9732B88a207747b3b830a'
const FRACTIONAL_ASSETS_ABI = [
  {
    inputs: [{ name: 'percentage', type: 'uint256' }],
    name: 'buyFraction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
]

function FractionalAssetsUI() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { writeContract } = useWriteContract()

  const buyFraction = async (percentage: number) => {
    if (!isConnected) {
      open() // Opens AppKit modal
      return
    }

    await writeContract({
      address: FRACTIONAL_ASSETS_ADDRESS,
      abi: FRACTIONAL_ASSETS_ABI,
      functionName: 'buyFraction',
      args: [percentage * 100], // Convert to basis points
      value: parseEther('0.01') // Payment in ETH
    })
  }

  return (
    <div>
      <button onClick={() => open()}>
        {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : 'Connect Wallet'}
      </button>
      
      <button onClick={() => buyFraction(1)}>
        Buy 1% Fraction
      </button>
    </div>
  )
}
```

## Advanced Features for Base

### 1. Coinbase Smart Wallet Support

```typescript
import { coinbaseWallet } from 'wagmi/connectors'

// Enhanced Coinbase Wallet configuration
const coinbaseConnector = coinbaseWallet({
  appName: 'FractionalAssets',
  appLogoUrl: 'https://fractionalassets.base.eth/logo.png',
  // Enable Smart Wallet (Account Abstraction)
  smartWalletOnly: false,
  // Prefer Coinbase Wallet extension
  preference: 'extension',
  // Custom RPC for Base
  jsonRpcUrl: 'https://mainnet.base.org'
})
```

### 2. Base-Specific Chain Configuration

```typescript
import { defineChain } from 'viem'

// Custom Base configuration with optimizations
const baseOptimized = defineChain({
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
      webSocket: ['wss://mainnet.base.org']
    },
    public: {
      http: ['https://mainnet.base.org']
    }
  },
  blockExplorers: {
    default: { 
      name: 'Basescan', 
      url: 'https://basescan.org' 
    }
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 5022
    }
  }
})
```

### 3. Gas Optimization for Base L2

```typescript
// Optimize gas for Base L2 transactions
const optimizedConfig = {
  // Batch RPC calls for efficiency
  batch: {
    multicall: {
      batchSize: 1024,
      wait: 16 // Base block time ~2s
    }
  },
  // Polling intervals optimized for Base
  pollingInterval: 2000, // Match Base block time
  // Cache for better performance
  cacheTime: 2_000,
  // Stale time for queries
  staleTime: 1_000
}
```

### 4. Email/Social Login for Base

```typescript
// Enable Web3 onboarding with email/social
const appKit = createAppKit({
  // ... other config
  features: {
    email: true, // Enable email login
    socials: ['google', 'github', 'discord', 'x'],
    emailShowWallets: true // Show wallet options after email login
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#0052FF', // Base blue
    '--w3m-color-mix-strength': 40
  }
})
```

## Error Handling

```typescript
import { BaseError } from 'viem'
import { useAppKit } from '@reown/appkit/react'

function handleWalletError(error: Error) {
  const { open } = useAppKit()
  
  if (error instanceof BaseError) {
    const revertError = error.walk(err => err.name === 'ContractFunctionRevertedError')
    
    if (revertError) {
      console.error('Contract reverted:', revertError.data)
    }
  }
  
  // Common Base network errors
  if (error.message.includes('user rejected')) {
    console.log('User cancelled transaction')
  } else if (error.message.includes('insufficient funds')) {
    alert('Insufficient ETH for gas on Base network')
  } else if (error.message.includes('network')) {
    open({ view: 'Networks' }) // Open network switcher
  }
}
```

## Testing Integration

```typescript
// Test file: appkit-base.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAppKit } from '@reown/appkit/react'

describe('AppKit Base Integration', () => {
  it('should connect to Base network', async () => {
    const { result } = renderHook(() => useAppKit())
    
    // Open modal
    result.current.open()
    
    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
      expect(result.current.chainId).toBe(8453) // Base chain ID
    })
  })
  
  it('should handle Base transactions', async () => {
    // Test transaction on Base
    const tx = await sendTransaction({
      to: FRACTIONAL_ASSETS_ADDRESS,
      value: parseEther('0.01'),
      chainId: 8453
    })
    
    expect(tx.hash).toBeDefined()
  })
})
```

## Performance Metrics

Based on production usage with FractionalAssets:

| Metric | Value | Notes |
|--------|-------|-------|
| Connection Time | <2s | Using WalletConnect v2 |
| Transaction Speed | ~2s | Base block time |
| Gas Cost | $0.02 | 99.6% cheaper than L1 |
| Supported Wallets | 300+ | All WalletConnect compatible |
| Mobile Support | ✅ | iOS/Android optimized |

## Troubleshooting

### Common Issues and Solutions

1. **"Unsupported chain" error**
   ```typescript
   // Ensure Base is in your chains config
   const config = createConfig({
     chains: [base], // Must include base
     // ...
   })
   ```

2. **Coinbase Wallet not appearing**
   ```typescript
   // Add Coinbase Wallet connector explicitly
   connectors: [
     coinbaseWallet({ appName: 'YourApp' }),
     // ...
   ]
   ```

3. **Slow RPC responses**
   ```typescript
   // Use dedicated Base RPC
   transports: {
     [base.id]: http('https://mainnet.base.org', {
       batch: true,
       retryCount: 3
     })
   }
   ```

## Migration from Web3Modal

If migrating from Web3Modal to AppKit:

```typescript
// Old (Web3Modal)
import { createWeb3Modal } from '@web3modal/wagmi/react'

// New (AppKit)
import { createAppKit } from '@reown/appkit/react'

// Configuration remains similar, just update imports
// and rename createWeb3Modal → createAppKit
```

## Resources

- [Reown AppKit Docs](https://docs.reown.com/appkit)
- [Base Documentation](https://docs.base.org)
- [Live Example](https://flipflop-prototype.vercel.app)
- [FractionalAssets Contract](https://basescan.org/address/0xBe49c093E87B400BF4f9732B88a207747b3b830a)

## Contributing

Have improvements for Base integration? Please submit a PR!

---

*Author: [@cryptoflops](https://github.com/cryptoflops) - Base builder with 45+ deployed contracts*
*Example: FractionalAssets protocol using AppKit on Base mainnet*