# TON Wallet Setup for Browser Extension

This guide explains how to set up and use the TON wallet functionality in the Reown browser extension.

## Prerequisites

1. Install dependencies:

```bash
bun install
```

## Environment Configuration

Add a TON private key to your `.env` file:

```bash
TON_PRIVATE_KEY=your_64_character_hex_private_key_here
```

### Generating a TON Private Key

If you need to generate a new TON keypair, you can use the TON crypto library:

```typescript
import { keyPairFromSeed } from '@ton/crypto'

// Generate random seed
const seed = crypto.getRandomValues(new Uint8Array(32))
const keypair = keyPairFromSeed(Buffer.from(seed))

console.log('Secret Key (hex):', keypair.secretKey.toString('hex'))
console.log('Public Key (hex):', keypair.publicKey.toString('hex'))
```

## Build and Test

1. Build the extension:

```bash
bun run build
```

2. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the browser-extension directory

## Features

The TON wallet provider supports the following TonConnect protocol features:

### Connection

- **connect()**: Establishes a connection and returns the wallet address
- **restoreConnection()**: Restores a previous connection on page reload
- **disconnect()**: Disconnects the wallet

### Signing

- **signData()**: Signs arbitrary data (text, binary, or cell)
  - Supports `type: 'text'` - for text messages
  - Supports `type: 'binary'` - for binary data (base64 encoded)
  - Supports `type: 'cell'` - for TON cells (base64 encoded)

### Transactions

- **sendMessage()**: Signs and sends TON transactions
  - Supports multiple messages in a single transaction
  - Automatically handles sequence numbers
  - Returns the BOC (Bag of Cells) as base64

## Usage in AppKit

The TON wallet will be automatically detected by AppKit's TON adapter when:

1. The extension is loaded in the browser
2. The page uses AppKit with TON support
3. The wallet is injected at `window.reownTon`

### Wallet Detection

The wallet exposes itself via the `jsBridgeKey: 'reownTon'` with the following metadata:

```javascript
{
  name: 'Reown',
  app_name: 'reown',
  image: '[base64 icon]',
  about_url: 'https://reown.com',
  platforms: ['chrome', 'firefox'],
  isWalletBrowser: false,
  protocolVersion: 2
}
```

### Example: Testing in Laboratory App

1. Start the laboratory app with TON support
2. The Reown wallet should appear in the wallet list
3. Click to connect
4. Test signing and transactions using the TON test components

## Network Support

Currently configured for:

- **Testnet** (chainId: `-3`)
- RPC: `https://testnet.toncenter.com/api/v2/jsonRPC`

To use mainnet, update the network ID in `inpage.ts` from `-3` to `-239` and update the RPC endpoint.

## Troubleshooting

### Wallet not appearing

- Check browser console for initialization errors
- Verify the TON_PRIVATE_KEY is set correctly in environment
- Ensure the extension is loaded and active

### Connection fails

- Check that the dApp is requesting TON support
- Verify the TonConnect protocol version (should be 2)
- Check browser console for detailed error messages

### Signing/Transaction errors

- Verify the data format matches the expected type (text/binary/cell)
- For binary and cell types, ensure data is base64 encoded
- Check that sufficient balance exists for transactions

## Development

The TON provider implementation can be found in:

- `/src/core/TonProvider.ts` - Main provider logic
- `/src/inpage.ts` - Window injection and TonConnect API
- `/src/utils/AccountUtil.ts` - Private key configuration

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit private keys to version control
2. Use environment variables for sensitive data
3. The current implementation is for testing/development only
4. Production wallets should use secure key storage (hardware wallets, encrypted storage, etc.)
5. Always verify transaction details before signing

## Additional Resources

- [TON Documentation](https://ton.org/docs)
- [TonConnect Protocol](https://github.com/ton-connect/docs)
- [AppKit Documentation](https://docs.reown.com)
