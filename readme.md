# AppKit

The full stack toolkit to build onchain app UX.

Onboard millions of users to your app in minutes with social & email embedded wallets, web3 wallet login, crypto swaps, on-ramp and more.

#### 📚 [Documentation](https://docs.reown.com/appkit/overview)

#### 🧪 [Laboratory](https://appkit-lab.reown.com)

#### 💻 [AppKit web examples repository](https://github.com/reown-com/appkit-web-examples)

#### 🔗 [Website](https://reown.com/appkit)

#### 🛟 [Contact us on Discord](https://discord.gg/reown)

<p align="center">
  <img src="./.github/assets/header.png" alt="" border="0">
</p>

## Features
Please check all our featurues for different SDKs in [docs](https://docs.reown.com/appkit/features).
- Swaps
- On-Ramp	
- Multichain Modal	
- Smart Accounts	
- Telegram Mini Apps	
- Sponsored Transactions	
- Networks: EVM Chains, Solana & Bitcoin	
- AppKit Core: Chain Agnostic
- Authentication: Email & Social Login, One-Click Auth & Sign with X (SIWX)

## AppKit Available SDKs
- [React](https://docs.reown.com/appkit/react/core/installation)
- [Next](https://docs.reown.com/appkit/next/core/installation)
- [Vue](https://docs.reown.com/appkit/vue/core/installation)
- [Javascript](https://docs.reown.com/appkit/javascript/core/installation)
- [React Native](https://docs.reown.com/appkit/react-native/core/installation)
- [Android](https://docs.reown.com/appkit/android/core/installation)
- [Flutter](https://docs.reown.com/appkit/flutter/core/installation)
- [iOS](https://docs.reown.com/appkit/ios/core/installation)
- [Unity](https://docs.reown.com/appkit/unity/core/installation)

## Dev setup

1. Create `apps/laboratory/.env.local` file using the template from `apps/laboratory/.env.example`

2. In each of the `examples` create `.env.local` file with following contents

```zsh
VITE_PROJECT_ID="your_project_id"
```

3. Run `pnpm watch` to build and watch for file changes in a separate tab
4. Run gallery, laboratory or examples in a separate tab i.e. `pnpm laboratory`

## Releasing new versions

### Enter prelease mode [Optional]

If you need to release a canary/alpha/beta you need to enter prelease mode first

```sh
pnpm changeset:pre <release tag>
```

For example: `pnpm changeset:pre a123bas2`

### Generate changeset

If you need to release a canary/alpha/beta you need to enter prelease mode first

```sh
pnpm changeset
```

### Steps

1. Run `pnpm update` and update dependencies
2. Run `pnpm install` and verify if everything still works correctly
3. Merge your feature branch into `main`
4. Changesets action will create or update a release PR
5. When such PR is merged, it will trigger an automatic deploy to npm and publish release on github

### Running tests

See <app/laboratory/tests/README.md>


> [!NOTE]
> Looking for Web3modal v[1-5]? [switch the branch](https://github.com/WalletConnect/web3modal/tree/V5).
