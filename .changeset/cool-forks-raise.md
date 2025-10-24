---
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-wallet-button': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-utils': patch
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-testing': patch
'@reown/appkit': patch
'@reown/appkit-common': patch
'@reown/appkit-ui': patch
---

Add full support for the TON (The Open Network) blockchain to AppKit, enabling users to connect TON wallets and perform TON-specific operations within the new WalletConnect protocol and TonConnect protocol.

## Examples

### Create AppKit with TON adapter

```
import { createAppKit } from '@reown/appkit'
import { ton, tonTestnet } from '@reown/appkit/networks'
import { TonAdapter } from '@reown/appkit-adapters-ton'

createAppKit({
  ...,
  networks: [ton, tonTestnet],
  adapters: [new TonAdapter()]
})
```

### Use TON adapter

```
const { address, isConnected } = useAppKitAccount({ namespace: "ton" })
```

### Multi-chain use cases

```
const { open } = useAppKit()
const { disconnect } = useDisconnect()

// Open AppKit with only TON connectors
open({ namespace: 'ton' })

// Disconnect only TON namespace
disconnect({ namespace: 'ton' })
```