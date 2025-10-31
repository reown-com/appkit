## Install project dependencies

```bash
pnpm install
```

Copy `.env.local.example` into your own `.env.local` file in the root folder:

```bash
cp .env.local
```

Make sure you have these variables:

```bash
EIP155_PRIVATE_KEY=
SOLANA_PRIVATE_KEY=
BIP122_PRIVATE_KEY=
TON_PRIVATE_KEY=
```

### Generate TON Key

To generate a TON private key, run:

```bash
node generate-ton-key.js
```

This will output a `TON_PRIVATE_KEY` that you can add to your `.env.local` file.

## Importing the extension

### 1. Build the extension

```bash
pnpm build
```

### 2. Enable Developer Mode in Chrome

Go to `chrome://extensions/` and enable `Developer mode`.

### 3. Import the extension

Click on `Load unpacked` and select the `dist` folder.

## Development

### 1. Start the development build

```bash
pnpm dev
```

### 2. Make changes to the code

Any changes to your code will trigger an update to the extension.

## Supported Chains

This browser extension wallet supports:

- **EVM** (Ethereum and compatible chains)
- **Solana**
- **Bitcoin**
- **TON** (The Open Network)

### TON Support

The extension implements a TonConnect-compatible wallet that can be detected by AppKit's TON adapter. For detailed TON setup and usage, see [TON_SETUP.md](./TON_SETUP.md).
