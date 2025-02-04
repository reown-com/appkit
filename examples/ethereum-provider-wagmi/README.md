# WalletConnectModal Wagmi Connector Example

This repository demonstrates how to use the [WalletConnect Wagmi Connector](https://wagmi.sh/react/api/connectors/walletConnect) following the deprecation of the [Ethereum Provider](https://www.npmjs.com/package/@walletconnect/ethereum-provider).

## Overview

There are two approaches to integrate the WalletConnect Wagmi Connector:

1. **Using the `@reown/appkit` package**: This package includes pre-built UI components for handling the WalletConnect QR code URI.
2. **Building custom UI components**: Implement your own UI components to handle the WalletConnect QR code URI.

This example provides guidance for both integration paths. The primary distinction lies in the `showQrModal` property when initializing the `walletConnect` connector.

```typescript
import { type WalletConnectParameters, walletConnect } from 'wagmi/connectors'

const params: WalletConnectParameters = {
  // Additional configuration options...
  showQrModal: true // Use `true` for the `@reown/appkit` package, or `false` for custom UI components
  // Additional configuration options...
}

const connector = walletConnect(params)
```

### Using the `@reown/appkit` Package

To integrate with the `@reown/appkit` package:

1. Install the package.
2. Configure the `walletConnect` connector with `showQrModal: true`.
3. Everything else remains consistent with the Wagmi setup.

### Custom UI Implementation

For a custom UI approach:

1. Set `showQrModal: false` when initializing the `walletConnect` connector.
2. Manually handle the WalletConnect QR code URI.
3. Refer to the [CustomWalletConnectConnector](./src/components/Connectors.tsx#L59) component as a guide for implementation.

## Running the Example

To run the example locally:

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start the development server**:

   ```bash
   pnpm dev
   ```

3. **Access the example in your browser**:

   Navigate to [http://localhost:3002](http://localhost:3002).

## Additional Resources

- [Wagmi](https://wagmi.sh/)
