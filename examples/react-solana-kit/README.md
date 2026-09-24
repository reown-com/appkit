# AppKit + `@solana/kit` integration example

Minimal example showing how a dApp developer integrates `@solana/kit` (web3.js 2.x) support in the Solana adapter.

This is separate from `apps/laboratory` (the internal QA harness, which exercises every connector and every legacy/versioned/solana-kit code path). This example is meant to read like documentation: the smallest possible integration, from a dApp's point of view.

## What it demonstrates

- **`provider.address`**: reading the connected account as a solana-kit `Address` alongside the existing `provider.publicKey` (`PublicKey`). Both describe the same account; `address` is purely additive.
- **Building and signing a `@solana/kit` transaction**: constructing a transaction entirely with `@solana/kit`'s pipeline (`createTransactionMessage` → `setTransactionMessageFeePayer` → `setTransactionMessageLifetimeUsingBlockhash` → `appendTransactionMessageInstructions` → `compileTransaction`), then passing it straight to the same `signTransaction`/`signAndSendTransaction` methods the adapter already exposed for legacy `@solana/web3.js` transactions. This example has no `@solana/web3.js` dependency at all: the transfer instruction is built with `@solana-program/system`'s `getTransferSolInstruction` (the solana-kit-native successor to `SystemProgram.transfer`), and since AppKit hands off the actual signing to the connected wallet rather than holding a keypair, the instruction's signer account is a `createNoopSigner(provider.address)` (a signer object that carries the address without being able to sign itself, exactly meant for this "someone else provides the signature" case).

See `src/components/SolanaKitDemo.tsx` for the actual integration code.

## Running it

```bash
pnpm install
pnpm --filter @examples/react-solana-kit dev
```

Connect a wallet on **Solana Devnet** (the default network here) and click through the three buttons. The transaction is a 100-lamport self-transfer, so it's safe to actually sign and send.
