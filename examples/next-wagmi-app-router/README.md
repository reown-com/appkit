# AppKit Next.js Wagmi Example (App Router)

Next.js App Router example using `@reown/appkit` with `@reown/appkit-adapter-wagmi`, including SSR via `cookieToInitialState` and `WagmiProvider`.

## Stack

- Next.js 16 (Turbopack by default)
- wagmi 2.x
- `@reown/appkit` + `@reown/appkit-adapter-wagmi`

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm build

# Copy env and set your WalletConnect Cloud project ID
cp examples/next-wagmi-app-router/.env.example examples/next-wagmi-app-router/.env.local

# Run the example
pnpm --filter @examples/next-wagmi-app-router dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
# Turbopack (Next.js 16 default)
pnpm --filter @examples/next-wagmi-app-router build

# Webpack
pnpm --filter @examples/next-wagmi-app-router exec next build --webpack
```

## SSR Setup

1. Pass `ssr: true` to `WagmiAdapter`.
2. Read cookies in a Server Component layout and pass them to a client `ContextProvider`.
3. Use `cookieToInitialState` + `WagmiProvider` in the client provider.

See `src/app/layout.tsx`, `src/context/index.tsx`, and `src/config/index.ts`.

## Next.js Config: Optional Connector Dependencies

`WagmiAdapter` can load connectors from `@wagmi/connectors` (Safe, Coinbase, Base Account, etc.). The `@wagmi/connectors` package references optional wallet SDKs that Next.js 16 may resolve at build time.

### Recommended: install optional peer dependencies

This example installs the optional packages below so `next build` succeeds with Turbopack and Webpack. Remove packages you do not use only if you also configure bundler stubs.

| Connector | Package |
| --------- | ------- |
| Base Account | `@base-org/account` |
| Coinbase Wallet | `@coinbase/wallet-sdk` |
| Gemini | `@gemini-wallet/core` |
| MetaMask SDK | `@metamask/sdk` |
| Porto | `porto` |
| Safe App | `@safe-global/safe-apps-provider`, `@safe-global/safe-apps-sdk` |

AppKit's WalletConnect flow uses `@walletconnect/universal-provider` (via AppKit). You do not need `@walletconnect/ethereum-provider` unless you use the wagmi WalletConnect connector directly.

### Alternative: stub uninstalled packages

If you prefer not to install unused wallet SDKs, stub those packages in your bundler config. Webpack users can use `webpack.externals` or `resolve.alias`. Turbopack users can use `turbopack.resolveAlias`, but the stub must expose any named exports that `@wagmi/connectors` imports.

Installing the optional packages above is simpler for this example. See [wevm/wagmi#4887](https://github.com/wevm/wagmi/issues/4887) and [wevm/wagmi#4906](https://github.com/wevm/wagmi/issues/4906).

### Next.js 16 bundler notes

- Next.js 16 defaults to Turbopack. If you define a `webpack` config, also set `turbopack: {}` (or migrate settings to `turbopack.resolveAlias`).
- `transpilePackages` includes AppKit and wagmi packages for App Router compatibility.

## wagmi v3

This example targets wagmi v2, which matches `@reown/appkit-adapter-wagmi` peer dependencies today. wagmi v3 uses the same optional-dependency model with stricter install requirements — see [wagmi v3 migration](https://wagmi.sh/react/guides/migrate-from-v2-to-v3).

## Learn More

- [AppKit Next.js docs](https://docs.reown.com/appkit/next/core/installation)
- [wagmi SSR](https://wagmi.sh/react/guides/ssr)
