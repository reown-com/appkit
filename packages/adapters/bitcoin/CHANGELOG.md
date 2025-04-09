# @reown/appkit-adapter-bitcoin

## 1.7.2

### Patch Changes

- [#4100](https://github.com/reown-com/appkit/pull/4100) [`848ad47`](https://github.com/reown-com/appkit/commit/848ad47d64ddbea4cbe4768f7374f63f2fcdf8a5) Thanks [@KannuSingh](https://github.com/KannuSingh)! - adds support for customizing universal provider configuration via a new universalProviderConfigOverride option

- [#4104](https://github.com/reown-com/appkit/pull/4104) [`b18d2a9`](https://github.com/reown-com/appkit/commit/b18d2a958d5f9d60e6e88f35e6f2c99d8f9291d6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `createAppKit` would throw an error if the universal provider failed to initialize

- [#4127](https://github.com/reown-com/appkit/pull/4127) [`542985c`](https://github.com/reown-com/appkit/commit/542985c79888e9753a51466b098aff65898eeb00) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where swaps were not working properly when using the ethers/ethers5 adapter

- [#4091](https://github.com/reown-com/appkit/pull/4091) [`1fc664d`](https://github.com/reown-com/appkit/commit/1fc664db6b109ac2ce9c66aec31a3ae2d6419589) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the WalletConnect wallet button wasn't opening the "All Wallets" modal view on mobile devices

- [#4102](https://github.com/reown-com/appkit/pull/4102) [`ae79b16`](https://github.com/reown-com/appkit/commit/ae79b164833193c363abfc42d9dd9ce0864d81ca) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the swap screen froze if allowance approval failed

- [#3883](https://github.com/reown-com/appkit/pull/3883) [`4b951b1`](https://github.com/reown-com/appkit/commit/4b951b14faea38b465295f53ed0c70820ebea63c) Thanks [@tomiir](https://github.com/tomiir)! - Adds `enableNetworkSwitcher` prop to allow disabling of network switching in the modal

- [#4094](https://github.com/reown-com/appkit/pull/4094) [`af1e79a`](https://github.com/reown-com/appkit/commit/af1e79a76d32def90c9605dc8e53a2ade002033c) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where users were required to re-check the legal checkbox after navigating away and returning to the connect view

- [#4109](https://github.com/reown-com/appkit/pull/4109) [`07e8b4e`](https://github.com/reown-com/appkit/commit/07e8b4e373181eb74af75c7a758998c5f129921e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `useAppKitProvider` hook from vue wasn't reflecting state changes in real-time

- [#4118](https://github.com/reown-com/appkit/pull/4118) [`b9871dc`](https://github.com/reown-com/appkit/commit/b9871dcea4f7e7aefa412f8a19318e7b60eda8a3) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where preferred account type wasn't properly switching on initial connection when using email/social login

- [#4103](https://github.com/reown-com/appkit/pull/4103) [`afc0739`](https://github.com/reown-com/appkit/commit/afc073935348bc90414fda0c26134938383d9fcc) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue where switchin between appkit instances result network to be not detected as expected.

  When AppKit initialized, if local storage active CAIP network value is something AppKit doesn't support, AppKit will redirect to first available network.

- [#4120](https://github.com/reown-com/appkit/pull/4120) [`ab75760`](https://github.com/reown-com/appkit/commit/ab757609cd28340d2bffb8ef718a4bb3df9d85ad) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `excludeWalletIds` option wasn't properly filtering Bitcoin wallets

- Updated dependencies [[`848ad47`](https://github.com/reown-com/appkit/commit/848ad47d64ddbea4cbe4768f7374f63f2fcdf8a5), [`b18d2a9`](https://github.com/reown-com/appkit/commit/b18d2a958d5f9d60e6e88f35e6f2c99d8f9291d6), [`542985c`](https://github.com/reown-com/appkit/commit/542985c79888e9753a51466b098aff65898eeb00), [`1fc664d`](https://github.com/reown-com/appkit/commit/1fc664db6b109ac2ce9c66aec31a3ae2d6419589), [`ae79b16`](https://github.com/reown-com/appkit/commit/ae79b164833193c363abfc42d9dd9ce0864d81ca), [`4b951b1`](https://github.com/reown-com/appkit/commit/4b951b14faea38b465295f53ed0c70820ebea63c), [`af1e79a`](https://github.com/reown-com/appkit/commit/af1e79a76d32def90c9605dc8e53a2ade002033c), [`07e8b4e`](https://github.com/reown-com/appkit/commit/07e8b4e373181eb74af75c7a758998c5f129921e), [`b9871dc`](https://github.com/reown-com/appkit/commit/b9871dcea4f7e7aefa412f8a19318e7b60eda8a3), [`afc0739`](https://github.com/reown-com/appkit/commit/afc073935348bc90414fda0c26134938383d9fcc), [`ab75760`](https://github.com/reown-com/appkit/commit/ab757609cd28340d2bffb8ef718a4bb3df9d85ad)]:
  - @reown/appkit-controllers@1.7.2
  - @reown/appkit@1.7.2
  - @reown/appkit-utils@1.7.2
  - @reown/appkit-common@1.7.2

## 1.7.1

### Patch Changes

- [#4014](https://github.com/reown-com/appkit/pull/4014) [`a945a10`](https://github.com/reown-com/appkit/commit/a945a10bb1a3b2beb33d6d4015714c9d623b1c84) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where network and wallet images weren't prefetched after connection

- [#4045](https://github.com/reown-com/appkit/pull/4045) [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509) Thanks [@tomiir](https://github.com/tomiir)! - Updates solana dependencies to latest stable version

- [#4052](https://github.com/reown-com/appkit/pull/4052) [`e7480ec`](https://github.com/reown-com/appkit/commit/e7480ec82af910d795e15a01222852f44e517d45) Thanks [@arein](https://github.com/arein)! - Disable `open` button until connection established

- [#4042](https://github.com/reown-com/appkit/pull/4042) [`0f21f5f`](https://github.com/reown-com/appkit/commit/0f21f5faaf1e8d51adcfe3e7a686792c5a8a4bf9) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes recommended wallets listing when opening modal with namespace filter

- [#4077](https://github.com/reown-com/appkit/pull/4077) [`2f4bdc2`](https://github.com/reown-com/appkit/commit/2f4bdc2bf4bd0820ea3c9d070295905f5cb30032) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds `customRpcUrls` prop to override default RPC URLs of the networks for native RPC calls.

  **Example**

  Define your map of chain ID / URL objects:

  ```jsx
  const customRpcUrls = {
    'eip155:1': [{ url: 'https://your-custom-mainnet-url.com' }],
    'eip155:137': [{ url: 'https://your-custom-polygon-url.com' }]
  }
  ```

  Pass it to the AppKit's `createAppKit` function.

  Additionally, if you are using Wagmi adapter you need to pass same `customRpcUrls` prop to `WagmiAdapter`.

  ```jsx
  const wagmiAdapter = new WagmiAdapter({
    networks: [...],
    projectId: "project-id",
    customRpcUrls
  })

  const modal = createAppKit({
    adapters: [...],
    networks: [...],
    projectId: "project-id",
    customRpcUrls
  })
  ```

  **Passing network props**

  If you need to pass fetch configs for your transport, you can use `config` property:

  ```jsx
  const customRpcUrls = {
    'eip155:1': [
      {
        url: 'https://your-custom-mainnet-url.com',
        config: {
          fetchOptions: {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        }
      }
    ]
  }
  ```

- [#4037](https://github.com/reown-com/appkit/pull/4037) [`478bd96`](https://github.com/reown-com/appkit/commit/478bd96106508fe89756d9f4f782679294a3a62a) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixed connector listing when filtering by namespace

- [#4049](https://github.com/reown-com/appkit/pull/4049) [`c7994ea`](https://github.com/reown-com/appkit/commit/c7994ea5afea893304449d52ef67e9f3037c913a) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates Bitcoin networks image ids

- [#4054](https://github.com/reown-com/appkit/pull/4054) [`8665987`](https://github.com/reown-com/appkit/commit/8665987d958df1c5e98c773ee92c26e7c8b68e24) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes redundant namespace filter while switching between networks

- [#4041](https://github.com/reown-com/appkit/pull/4041) [`5c14b6e`](https://github.com/reown-com/appkit/commit/5c14b6eac7bdabfa93223c5ada263903e5c60273) Thanks [@tomiir](https://github.com/tomiir)! - Declares appkit packages in ui dependencies

- [#4030](https://github.com/reown-com/appkit/pull/4030) [`eeb2c84`](https://github.com/reown-com/appkit/commit/eeb2c842018a4d6215716f64e53a045cfa206f6c) Thanks [@enesozturk](https://github.com/enesozturk)! - Allows disconnecting specific namespace. Users can pass `ChainNamespace` value to `disconnect()` function returned from `useDisconnect`, and disconnect only given namespace.

  If namespace is not passed, it'll disconnect all namespaces.

  **Example usage:**

  ```tsx
  const { disconnect } = useDisconnect()

  <Button onClick={() => disconnect({ namespace: 'solana' })}>
    Disconnect Solana
  </Button>
  ```

- [#4035](https://github.com/reown-com/appkit/pull/4035) [`02a2d53`](https://github.com/reown-com/appkit/commit/02a2d53a87922c22f32c70c2a73b6b7a809f237c) Thanks [@tomiir](https://github.com/tomiir)! - Updates dependencies and applies overrides for nested subdependenceis with high level vulnerabilities

- [#4045](https://github.com/reown-com/appkit/pull/4045) [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509) Thanks [@tomiir](https://github.com/tomiir)! - Patches changesets action to allow for automatic canaries and GH Changelogs

- [#4046](https://github.com/reown-com/appkit/pull/4046) [`475e422`](https://github.com/reown-com/appkit/commit/475e422a1c02b85d5a314851aea56795e341ea7a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the CAIP address was not set for the namespace when using multichain

- [#4068](https://github.com/reown-com/appkit/pull/4068) [`7e6dfcd`](https://github.com/reown-com/appkit/commit/7e6dfcd77cded48cc3d1b004a37eba6464309d71) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Coinbase Wallet wasn't working with multichain

- [#4055](https://github.com/reown-com/appkit/pull/4055) [`4f79747`](https://github.com/reown-com/appkit/commit/4f79747373b65c020dcca7c7ac671dc1d31aa5f1) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds Bitcoin logo to wui-visual to use on chain switch screen

- [#3925](https://github.com/reown-com/appkit/pull/3925) [`093f24c`](https://github.com/reown-com/appkit/commit/093f24c69632aaeeb8ffe3120fadb6a65952ff3b) Thanks [@magiziz](https://github.com/magiziz)! - - Added email wallet button

  - Added email update functionality

  **TypeScript Example usage**

  ```ts
  import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

  const appKitWalletButton = createAppKitWalletButton()

  const connectEmail = async () => {
    const { address, chainId, chainNamespace } = await appKitWalletButton.connect('email')

    return { address, chainId, chainNamespace }
  }

  const updateEmail = async () => {
    const { email } = await appKitWalletButton.updateEmail()

    return email // Return the new updated email
  }
  ```

  **React Hook Example usage**

  ```tsx
  import { useAppKitUpdateEmail, useAppKitWallet } from '@reown/appkit-wallet-button/react'

  export function ConnectEmail() {
    const { data, error, isPending, isSuccess, isError, connect } = useAppKitWallet({
      onError: err => {
        // ...
      },
      onSuccess: data => {
        // ...
      }
    })

    return <button onClick={() => connect('email')}>Connect Email</button>
  }

  export function UpdateEmail() {
    const { data, error, isPending, isSuccess, isError, updateEmail } = useAppKitUpdateEmail({
      onError: err => {
        // ...
      },
      onSuccess: data => {
        // ...
      }
    })

    return <button onClick={() => updateEmail()}>Update Email</button>
  }
  ```

- [#4048](https://github.com/reown-com/appkit/pull/4048) [`ffb8188`](https://github.com/reown-com/appkit/commit/ffb81887a0ce663ce55973118aeb2e7368ab284a) Thanks [@tomiir](https://github.com/tomiir)! - Interecepts Leather wallet image and injects the missing '+xml' declaration

- [#4074](https://github.com/reown-com/appkit/pull/4074) [`d59d1dc`](https://github.com/reown-com/appkit/commit/d59d1dcb0cec891dc20f531fbcd0b08eba77c9e2) Thanks [@magiziz](https://github.com/magiziz)! - Added support for customizing connector positions in connect modal.

  The array order determines the exact display order, in the example below the injected wallets will appear first, followed by WalletConnect and then recent wallets.

  **Example usage**

  ```tsx
  import { createAppKit } from '@reown/appkit'

  const modal = createAppKit({
    adapters: [], // Add your adapters here
    networks: [], // Add your networks here
    projectId: 'YOUR_PROJECT_ID',
    features: {
      connectorTypeOrder: ['injected', 'walletConnect', 'recent']
    }
  })
  ```

- Updated dependencies [[`a945a10`](https://github.com/reown-com/appkit/commit/a945a10bb1a3b2beb33d6d4015714c9d623b1c84), [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509), [`e7480ec`](https://github.com/reown-com/appkit/commit/e7480ec82af910d795e15a01222852f44e517d45), [`0f21f5f`](https://github.com/reown-com/appkit/commit/0f21f5faaf1e8d51adcfe3e7a686792c5a8a4bf9), [`2f4bdc2`](https://github.com/reown-com/appkit/commit/2f4bdc2bf4bd0820ea3c9d070295905f5cb30032), [`478bd96`](https://github.com/reown-com/appkit/commit/478bd96106508fe89756d9f4f782679294a3a62a), [`c7994ea`](https://github.com/reown-com/appkit/commit/c7994ea5afea893304449d52ef67e9f3037c913a), [`8665987`](https://github.com/reown-com/appkit/commit/8665987d958df1c5e98c773ee92c26e7c8b68e24), [`5c14b6e`](https://github.com/reown-com/appkit/commit/5c14b6eac7bdabfa93223c5ada263903e5c60273), [`eeb2c84`](https://github.com/reown-com/appkit/commit/eeb2c842018a4d6215716f64e53a045cfa206f6c), [`02a2d53`](https://github.com/reown-com/appkit/commit/02a2d53a87922c22f32c70c2a73b6b7a809f237c), [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509), [`475e422`](https://github.com/reown-com/appkit/commit/475e422a1c02b85d5a314851aea56795e341ea7a), [`7e6dfcd`](https://github.com/reown-com/appkit/commit/7e6dfcd77cded48cc3d1b004a37eba6464309d71), [`4f79747`](https://github.com/reown-com/appkit/commit/4f79747373b65c020dcca7c7ac671dc1d31aa5f1), [`093f24c`](https://github.com/reown-com/appkit/commit/093f24c69632aaeeb8ffe3120fadb6a65952ff3b), [`ffb8188`](https://github.com/reown-com/appkit/commit/ffb81887a0ce663ce55973118aeb2e7368ab284a), [`d59d1dc`](https://github.com/reown-com/appkit/commit/d59d1dcb0cec891dc20f531fbcd0b08eba77c9e2)]:
  - @reown/appkit-controllers@1.7.1
  - @reown/appkit@1.7.1
  - @reown/appkit-utils@1.7.1
  - @reown/appkit-common@1.7.1

## 1.7.0

### Minor Changes

- [#3976](https://github.com/reown-com/appkit/pull/3976) [`cbd929f`](https://github.com/reown-com/appkit/commit/cbd929f839ad7ee4c7838fa980bcfd63b40b1415) Thanks [@tomiir](https://github.com/tomiir)! - Adds @reown/appkit-controllers. Proxies @reown/appkit-core to the new controllers package to maintain backwards compatibility.

### Patch Changes

- [#4002](https://github.com/reown-com/appkit/pull/4002) [`4fb30b0`](https://github.com/reown-com/appkit/commit/4fb30b06af2fcca0cffdae80f7ece7a9b498df4e) Thanks [@magiziz](https://github.com/magiziz)! - Updated the CDN package to identify as "cdn" instead of "html" in event tracking

- [#3952](https://github.com/reown-com/appkit/pull/3952) [`8b0f958`](https://github.com/reown-com/appkit/commit/8b0f958b8e4169564a1c77da33a1c9d15554094c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes profile name syncing when switching to non EVM network or to a testnet

- [#3998](https://github.com/reown-com/appkit/pull/3998) [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a) Thanks [@tomiir](https://github.com/tomiir)! - Removes balance fetch on account sync for core

- [#3961](https://github.com/reown-com/appkit/pull/3961) [`7280345`](https://github.com/reown-com/appkit/commit/7280345ecb39359c9a5271f0ff9ebfb902379272) Thanks [@tomiir](https://github.com/tomiir)! - Adds UX by reown footer to connection screens

- [#3985](https://github.com/reown-com/appkit/pull/3985) [`569aa92`](https://github.com/reown-com/appkit/commit/569aa92cddfe51aa93c2ca201eeb500da28e8a1a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where users could not use the embedded wallet if they denied access to their email address and/or username

- [#3860](https://github.com/reown-com/appkit/pull/3860) [`dc6c6ab`](https://github.com/reown-com/appkit/commit/dc6c6abb30fb4cbc9b7241cb8af6e6f970e71f62) Thanks [@tomiir](https://github.com/tomiir)! - Initializes Solana connection on adapter construction

- [#3969](https://github.com/reown-com/appkit/pull/3969) [`42e0f0e`](https://github.com/reown-com/appkit/commit/42e0f0ed9e0ef87cd5eae641dfb8bc8d267e1b44) Thanks [@magiziz](https://github.com/magiziz)! - Added `appKit.getAccount` public method

- [#3757](https://github.com/reown-com/appkit/pull/3757) [`95980b9`](https://github.com/reown-com/appkit/commit/95980b955955e9e50336e91789d9838a53534558) Thanks [@tomiir](https://github.com/tomiir)! - Splits code into basic and regular appkit. Re-exports ui and scaffold components so they can be tree-shaken. Dynamically import appropiate chunks according to feature flags'

- [#3998](https://github.com/reown-com/appkit/pull/3998) [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a) Thanks [@tomiir](https://github.com/tomiir)! - Removes identity calls from core account sync

- [#3916](https://github.com/reown-com/appkit/pull/3916) [`29779a4`](https://github.com/reown-com/appkit/commit/29779a491e2ef38e5e945afcf79601cede6d1219) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where connection status was incorrectly set on page refresh after attempting to connect with WalletConnect.

- [#3987](https://github.com/reown-com/appkit/pull/3987) [`ce9e3c1`](https://github.com/reown-com/appkit/commit/ce9e3c1baa0189c843359ab46aa3fa0ed8f18d14) Thanks [@enesozturk](https://github.com/enesozturk)! - Handles namespace switching when calling `open()` function. Passing `namespace` to `open()` function, AppKit will switch to that namespace. If namespace is connected, it'll open Account button, if not it'll open Connect screen.

  **Example:**

  ```jsx
  const { open } = useAppKit()

  open({ namespace: 'eip155' })
  ```

  This could be combined with `view` parameter as well. It'll switch to that namespace and open relevant page.

  **Example:**

  ```jsx
  const { open } = useAppKit()

  open({ view: 'Connect', namespace: 'eip155' })
  ```

- [#3936](https://github.com/reown-com/appkit/pull/3936) [`df403d9`](https://github.com/reown-com/appkit/commit/df403d9cce342c7b75864ec5fa841324a647434c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds namespace parameter to AppKit buttons.

  This allows users to render namespace specific connect & account buttons. When namespace has passed, connect button opens connect page with only that namespace's connectors and account button shows only that namespace's account info.

  **Example:**

  ```js
  <appkit-button namespace="eip155" />
  <appkit-button namespace="solana" />
  <appkit-button namespace="bip122" />
  ```

- [#3999](https://github.com/reown-com/appkit/pull/3999) [`503b34f`](https://github.com/reown-com/appkit/commit/503b34f904b246c78319307d6892a694d5d40c0f) Thanks [@tomiir](https://github.com/tomiir)! - Updates @walletconnect packages to 1.19.1

- [#3970](https://github.com/reown-com/appkit/pull/3970) [`b5273b6`](https://github.com/reown-com/appkit/commit/b5273b6ca5de673f74fff01f3a1c460a9869903d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi triggered a disconnect on page refresh

- [#3885](https://github.com/reown-com/appkit/pull/3885) [`4332bd4`](https://github.com/reown-com/appkit/commit/4332bd4156c5452f1a4e20f497463b440264bb93) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - scrapped reconnect logic on WC connection rejection

- Updated dependencies [[`4fb30b0`](https://github.com/reown-com/appkit/commit/4fb30b06af2fcca0cffdae80f7ece7a9b498df4e), [`8b0f958`](https://github.com/reown-com/appkit/commit/8b0f958b8e4169564a1c77da33a1c9d15554094c), [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a), [`7280345`](https://github.com/reown-com/appkit/commit/7280345ecb39359c9a5271f0ff9ebfb902379272), [`569aa92`](https://github.com/reown-com/appkit/commit/569aa92cddfe51aa93c2ca201eeb500da28e8a1a), [`dc6c6ab`](https://github.com/reown-com/appkit/commit/dc6c6abb30fb4cbc9b7241cb8af6e6f970e71f62), [`42e0f0e`](https://github.com/reown-com/appkit/commit/42e0f0ed9e0ef87cd5eae641dfb8bc8d267e1b44), [`95980b9`](https://github.com/reown-com/appkit/commit/95980b955955e9e50336e91789d9838a53534558), [`7c9e4d6`](https://github.com/reown-com/appkit/commit/7c9e4d6c8fabd9bf45fb08fc867090bac47665d2), [`cbd929f`](https://github.com/reown-com/appkit/commit/cbd929f839ad7ee4c7838fa980bcfd63b40b1415), [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a), [`29779a4`](https://github.com/reown-com/appkit/commit/29779a491e2ef38e5e945afcf79601cede6d1219), [`ce9e3c1`](https://github.com/reown-com/appkit/commit/ce9e3c1baa0189c843359ab46aa3fa0ed8f18d14), [`df403d9`](https://github.com/reown-com/appkit/commit/df403d9cce342c7b75864ec5fa841324a647434c), [`503b34f`](https://github.com/reown-com/appkit/commit/503b34f904b246c78319307d6892a694d5d40c0f), [`b5273b6`](https://github.com/reown-com/appkit/commit/b5273b6ca5de673f74fff01f3a1c460a9869903d), [`4332bd4`](https://github.com/reown-com/appkit/commit/4332bd4156c5452f1a4e20f497463b440264bb93)]:
  - @reown/appkit-controllers@1.7.0
  - @reown/appkit@1.7.0
  - @reown/appkit-common@1.7.0
  - @reown/appkit-utils@1.7.0

## 1.6.9

### Patch Changes

- [#3878](https://github.com/reown-com/appkit/pull/3878) [`f9e66b9`](https://github.com/reown-com/appkit/commit/f9e66b94982cae004b9f2058eff1e845543a48c6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where social popup window was blocked by safari

- [#3818](https://github.com/reown-com/appkit/pull/3818) [`bf90239`](https://github.com/reown-com/appkit/commit/bf90239f89090a63d7c7eefc762471978aeceaad) Thanks [@enesozturk](https://github.com/enesozturk)! - Allows getting chain specific account data with hooks and subscribe methods

  ### Example Usage

  ```tsx
  import { useAppKitAccount } from '@reown/appkit/react'

  const accountState = useAppKitAccount() // Returns active chain's account state
  const evmAccountState = useAppKitAccount({ chainNamespace: 'eip155' }) // Returns EVM chain's account state
  const solanaAccountState = useAppKitAccount({ chainNamespace: 'solana' }) // Returns Solana chain's account state
  const bitcoinAccountState = useAppKitAccount({ chainNamespace: 'bip122' }) // Returns Bitcoin chain's account state
  ```

- [#3764](https://github.com/reown-com/appkit/pull/3764) [`73fbd0f`](https://github.com/reown-com/appkit/commit/73fbd0fc11aaba80f5a5054659fe6eb3b3211400) Thanks [@magiziz](https://github.com/magiziz)! - Deprecated api headers to use query parameters

- [#3833](https://github.com/reown-com/appkit/pull/3833) [`ff75922`](https://github.com/reown-com/appkit/commit/ff75922b49169f24d58ed2e41238a8d1d6e9164e) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Set wallet to undefined after unmount of QR view

- [#3832](https://github.com/reown-com/appkit/pull/3832) [`64a03e1`](https://github.com/reown-com/appkit/commit/64a03e147be917ffc630bdefb628ad303cce7b20) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add error message to SEND_ERROR event

- [#3864](https://github.com/reown-com/appkit/pull/3864) [`aeae09c`](https://github.com/reown-com/appkit/commit/aeae09cb4a01451cb59c639dbc50e9de13086e87) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Applied a fix where we correctly clear the wallet state

- [#3895](https://github.com/reown-com/appkit/pull/3895) [`8d2a81f`](https://github.com/reown-com/appkit/commit/8d2a81f48875c2810c5e341ce4822635696c7b2b) Thanks [@magiziz](https://github.com/magiziz)! - Add await in switchNetwork

- [#3869](https://github.com/reown-com/appkit/pull/3869) [`b264e3b`](https://github.com/reown-com/appkit/commit/b264e3b940d28f903d0f83292b00f4fb66423118) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes defaultNetwork prop that is not being used on initialization

- [#3785](https://github.com/reown-com/appkit/pull/3785) [`faf3f25`](https://github.com/reown-com/appkit/commit/faf3f253541ba82da47da5b7f285da6400a0ab58) Thanks [@magiziz](https://github.com/magiziz)! - Added support for react version 19

- [#3847](https://github.com/reown-com/appkit/pull/3847) [`675d863`](https://github.com/reown-com/appkit/commit/675d86364d38e88e069d1b739683d16e4ff2ee71) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where switching to an unrecognized chain in MM mobile resulted in INVALID_CHAIN error which was not parsed for wallet_addEthereumChain request

- [#3870](https://github.com/reown-com/appkit/pull/3870) [`eb510b0`](https://github.com/reown-com/appkit/commit/eb510b0901f0a115b48a555d2839a14c92eaccf4) Thanks [@zoruka](https://github.com/zoruka)! - Add extra metadata about connected wallet sent to cloud auth siwx

- [#3917](https://github.com/reown-com/appkit/pull/3917) [`bebdea0`](https://github.com/reown-com/appkit/commit/bebdea0fe73872ab8bfd9549bb1275b598c85821) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix a case where wagmi is not getting the correct session state

- [#3910](https://github.com/reown-com/appkit/pull/3910) [`62bb4da`](https://github.com/reown-com/appkit/commit/62bb4da13eefc1059bfc5b060f0f51b2b8892cca) Thanks [@tomiir](https://github.com/tomiir)! - Adds st and sv params to identity call on Blockchain Api

- [#3881](https://github.com/reown-com/appkit/pull/3881) [`1f319cd`](https://github.com/reown-com/appkit/commit/1f319cd5e5fb014d66725d2f9b975ec2ed08f21e) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes fetch identity call where if the network is not supported by wallet and if switched to another network

- [#3876](https://github.com/reown-com/appkit/pull/3876) [`c2a833b`](https://github.com/reown-com/appkit/commit/c2a833b83e647bda357b6338913df42a3336fdf3) Thanks [@magiziz](https://github.com/magiziz)! - Added bitcoin support for wallet buttons

- [#3868](https://github.com/reown-com/appkit/pull/3868) [`8e11300`](https://github.com/reown-com/appkit/commit/8e1130061ed5ad175093a8a1f4057646d30f049b) Thanks [@tomiir](https://github.com/tomiir)! - Sets default chain to current appkit chain on WC connections

- Updated dependencies [[`f9e66b9`](https://github.com/reown-com/appkit/commit/f9e66b94982cae004b9f2058eff1e845543a48c6), [`bf90239`](https://github.com/reown-com/appkit/commit/bf90239f89090a63d7c7eefc762471978aeceaad), [`73fbd0f`](https://github.com/reown-com/appkit/commit/73fbd0fc11aaba80f5a5054659fe6eb3b3211400), [`ff75922`](https://github.com/reown-com/appkit/commit/ff75922b49169f24d58ed2e41238a8d1d6e9164e), [`64a03e1`](https://github.com/reown-com/appkit/commit/64a03e147be917ffc630bdefb628ad303cce7b20), [`aeae09c`](https://github.com/reown-com/appkit/commit/aeae09cb4a01451cb59c639dbc50e9de13086e87), [`8d2a81f`](https://github.com/reown-com/appkit/commit/8d2a81f48875c2810c5e341ce4822635696c7b2b), [`b264e3b`](https://github.com/reown-com/appkit/commit/b264e3b940d28f903d0f83292b00f4fb66423118), [`faf3f25`](https://github.com/reown-com/appkit/commit/faf3f253541ba82da47da5b7f285da6400a0ab58), [`573bdfc`](https://github.com/reown-com/appkit/commit/573bdfcb7bc86f3385a2151d7a3e854c22804ea1), [`675d863`](https://github.com/reown-com/appkit/commit/675d86364d38e88e069d1b739683d16e4ff2ee71), [`eb510b0`](https://github.com/reown-com/appkit/commit/eb510b0901f0a115b48a555d2839a14c92eaccf4), [`bebdea0`](https://github.com/reown-com/appkit/commit/bebdea0fe73872ab8bfd9549bb1275b598c85821), [`62bb4da`](https://github.com/reown-com/appkit/commit/62bb4da13eefc1059bfc5b060f0f51b2b8892cca), [`1f319cd`](https://github.com/reown-com/appkit/commit/1f319cd5e5fb014d66725d2f9b975ec2ed08f21e), [`c2a833b`](https://github.com/reown-com/appkit/commit/c2a833b83e647bda357b6338913df42a3336fdf3), [`8e11300`](https://github.com/reown-com/appkit/commit/8e1130061ed5ad175093a8a1f4057646d30f049b)]:
  - @reown/appkit@1.6.9
  - @reown/appkit-utils@1.6.9
  - @reown/appkit-common@1.6.9
  - @reown/appkit-core@1.6.9

## 1.6.8

### Patch Changes

- [#3828](https://github.com/reown-com/appkit/pull/3828) [`381b7f1`](https://github.com/reown-com/appkit/commit/381b7f16bd649556b3efe4f97368528b9296c794) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades Wagmi, Viem and Coinbase Wallet SDK deps

- Updated dependencies [[`381b7f1`](https://github.com/reown-com/appkit/commit/381b7f16bd649556b3efe4f97368528b9296c794)]:
  - @reown/appkit@1.6.8
  - @reown/appkit-common@1.6.8
  - @reown/appkit-core@1.6.8

## 1.6.7

### Patch Changes

- [#3820](https://github.com/reown-com/appkit/pull/3820) [`cc8efe9`](https://github.com/reown-com/appkit/commit/cc8efe967fa449b83e899afc23483effcc8adaf6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue where the modal doesn't recognize a difference between modal and wallet active network which causes issues when doing wallet actions"

- Updated dependencies [[`cc8efe9`](https://github.com/reown-com/appkit/commit/cc8efe967fa449b83e899afc23483effcc8adaf6)]:
  - @reown/appkit-core@1.6.7
  - @reown/appkit@1.6.7
  - @reown/appkit-common@1.6.7

## 1.6.6

### Patch Changes

- [#3789](https://github.com/reown-com/appkit/pull/3789) [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors extendCaipNetwork util function to not override it if already extended

- [#3751](https://github.com/reown-com/appkit/pull/3751) [`59e8b17`](https://github.com/reown-com/appkit/commit/59e8b17248581e1ba1a5e67497c3354c1f0aaa0c) Thanks [@zoruka](https://github.com/zoruka)! - Upgrade `@walletconnect/*` packages to `2.18.x`

- [#3736](https://github.com/reown-com/appkit/pull/3736) [`146df81`](https://github.com/reown-com/appkit/commit/146df816174ced5dfc49c49624d25db7aa07faf5) Thanks [@tomiir](https://github.com/tomiir)! - Adds address field to analytics event

- [#3776](https://github.com/reown-com/appkit/pull/3776) [`78c0d56`](https://github.com/reown-com/appkit/commit/78c0d5640a8d3ecbdde5b5ca8db36c223614740e) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors get month by index method

- [#3787](https://github.com/reown-com/appkit/pull/3787) [`1027b27`](https://github.com/reown-com/appkit/commit/1027b274eb75df6cf807e735fa9e7a23f1f53c17) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Don't render browser tabs on AppKit Core

- [#3760](https://github.com/reown-com/appkit/pull/3760) [`a7590da`](https://github.com/reown-com/appkit/commit/a7590da456ee0f51b7e6b50e24d36eda88cd86eb) Thanks [@magiziz](https://github.com/magiziz)! - Improved wallet image loading by fetching them only when the modal is opened instead of on page load.

- [#3754](https://github.com/reown-com/appkit/pull/3754) [`5875b22`](https://github.com/reown-com/appkit/commit/5875b226c6e20258c493f3430b1160b19d72640f) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes SIWE package dependency from AppKit main package

- [#3782](https://github.com/reown-com/appkit/pull/3782) [`7f46c56`](https://github.com/reown-com/appkit/commit/7f46c56f1300aa0dc84e890639773b1ad80ce2ae) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades third party dependencies

- [#3766](https://github.com/reown-com/appkit/pull/3766) [`4580387`](https://github.com/reown-com/appkit/commit/4580387122e740c4041c4c49ec752980e11dd5fa) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes subscribeAccount where it needs to listen ConnectorController changes while returning account state

- [#3746](https://github.com/reown-com/appkit/pull/3746) [`171b8ae`](https://github.com/reown-com/appkit/commit/171b8ae4888afb188177e5697f5f484536def90c) Thanks [@enesozturk](https://github.com/enesozturk)! - Remove ontouchstart events from buttons

- [#3768](https://github.com/reown-com/appkit/pull/3768) [`bc278cb`](https://github.com/reown-com/appkit/commit/bc278cb20ec1451484d10fb5f3403e7d47354f40) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Replace bignumber for big.js

- [#3786](https://github.com/reown-com/appkit/pull/3786) [`d49404d`](https://github.com/reown-com/appkit/commit/d49404d210c2c1245b300c730009ad4e6770c984) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add logic to correctly switch chains in universalAdapter

- [#3727](https://github.com/reown-com/appkit/pull/3727) [`a6f0943`](https://github.com/reown-com/appkit/commit/a6f0943945ca7291fca44f4b524fc7c128df808d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where signing was not working when switching chains using WalletConnect with ethers/ethers5 adapters.

- [#3752](https://github.com/reown-com/appkit/pull/3752) [`9ce44fe`](https://github.com/reown-com/appkit/commit/9ce44feb15f81b54b80c27b0390ad7e277e30f8e) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors syncConnectors to dynamically import Coinbase Wallet SDK

- [#3775](https://github.com/reown-com/appkit/pull/3775) [`e2c2d38`](https://github.com/reown-com/appkit/commit/e2c2d388dab1c2136cc998c1accebc1791eaa0ff) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors Universal Link handling for Solana wallets to use explicit user action

- [#3771](https://github.com/reown-com/appkit/pull/3771) [`bf04326`](https://github.com/reown-com/appkit/commit/bf04326cbde01b04ea9284c168960b1337d3d435) Thanks [@enesozturk](https://github.com/enesozturk)! - Filters connectors when switching to another namespace after connecting to one

- [#3724](https://github.com/reown-com/appkit/pull/3724) [`5054449`](https://github.com/reown-com/appkit/commit/50544491c855d6b21cbbb162b4fc0cf5637a395c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds network add/remove methods for dynamically setting networks

- [#3789](https://github.com/reown-com/appkit/pull/3789) [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors AppKit initialize function to separate initializing Pulse event and uses anonymous function for display_uri callback

- [#3798](https://github.com/reown-com/appkit/pull/3798) [`9099148`](https://github.com/reown-com/appkit/commit/90991481fc25987d0a3f07902979c2c9d4e399a9) Thanks [@tomiir](https://github.com/tomiir)! - Re-expose rotated meld key to prevent key mismatches on onramp flows

- [#3784](https://github.com/reown-com/appkit/pull/3784) [`b4e3dfd`](https://github.com/reown-com/appkit/commit/b4e3dfd6f541b107eedd7748d134f6bea348f176) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes add remove network function logics to prevent duplications

- [#3790](https://github.com/reown-com/appkit/pull/3790) [`cad4da7`](https://github.com/reown-com/appkit/commit/cad4da7a13f9b5d97c38348b593014486fb44829) Thanks [@tomiir](https://github.com/tomiir)! - Replaces blockchain api requests for balance with native balance requests

- Updated dependencies [[`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471), [`59e8b17`](https://github.com/reown-com/appkit/commit/59e8b17248581e1ba1a5e67497c3354c1f0aaa0c), [`146df81`](https://github.com/reown-com/appkit/commit/146df816174ced5dfc49c49624d25db7aa07faf5), [`78c0d56`](https://github.com/reown-com/appkit/commit/78c0d5640a8d3ecbdde5b5ca8db36c223614740e), [`1027b27`](https://github.com/reown-com/appkit/commit/1027b274eb75df6cf807e735fa9e7a23f1f53c17), [`a7590da`](https://github.com/reown-com/appkit/commit/a7590da456ee0f51b7e6b50e24d36eda88cd86eb), [`5875b22`](https://github.com/reown-com/appkit/commit/5875b226c6e20258c493f3430b1160b19d72640f), [`7f46c56`](https://github.com/reown-com/appkit/commit/7f46c56f1300aa0dc84e890639773b1ad80ce2ae), [`4580387`](https://github.com/reown-com/appkit/commit/4580387122e740c4041c4c49ec752980e11dd5fa), [`171b8ae`](https://github.com/reown-com/appkit/commit/171b8ae4888afb188177e5697f5f484536def90c), [`bc278cb`](https://github.com/reown-com/appkit/commit/bc278cb20ec1451484d10fb5f3403e7d47354f40), [`d49404d`](https://github.com/reown-com/appkit/commit/d49404d210c2c1245b300c730009ad4e6770c984), [`a6f0943`](https://github.com/reown-com/appkit/commit/a6f0943945ca7291fca44f4b524fc7c128df808d), [`9ce44fe`](https://github.com/reown-com/appkit/commit/9ce44feb15f81b54b80c27b0390ad7e277e30f8e), [`e2c2d38`](https://github.com/reown-com/appkit/commit/e2c2d388dab1c2136cc998c1accebc1791eaa0ff), [`bf04326`](https://github.com/reown-com/appkit/commit/bf04326cbde01b04ea9284c168960b1337d3d435), [`5054449`](https://github.com/reown-com/appkit/commit/50544491c855d6b21cbbb162b4fc0cf5637a395c), [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471), [`9099148`](https://github.com/reown-com/appkit/commit/90991481fc25987d0a3f07902979c2c9d4e399a9), [`b4e3dfd`](https://github.com/reown-com/appkit/commit/b4e3dfd6f541b107eedd7748d134f6bea348f176), [`cad4da7`](https://github.com/reown-com/appkit/commit/cad4da7a13f9b5d97c38348b593014486fb44829)]:
  - @reown/appkit@1.6.6
  - @reown/appkit-common@1.6.6
  - @reown/appkit-core@1.6.6

## 1.6.5

### Patch Changes

- [#3523](https://github.com/reown-com/appkit/pull/3523) [`427dde3`](https://github.com/reown-com/appkit/commit/427dde3cfb3bcb8a61d22b3732150c39958483e8) Thanks [@zoruka](https://github.com/zoruka)! - Abstracts Connectors management in Solana Adapter

- [#3648](https://github.com/reown-com/appkit/pull/3648) [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where mobile view would show auth login options without adapters

- [#3589](https://github.com/reown-com/appkit/pull/3589) [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors network switching when trying to use auth connector but active network is not supported by auth connector

- [#3589](https://github.com/reown-com/appkit/pull/3589) [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connector rendering logics when add/remove adapters for email/social login

- [#3638](https://github.com/reown-com/appkit/pull/3638) [`86e7510`](https://github.com/reown-com/appkit/commit/86e75103084d6babdb0d0bb8afbbe30199fb3dde) Thanks [@zoruka](https://github.com/zoruka)! - Fix condition for unsupported chain for `chainChanged` event on wallet connect event

- [#3637](https://github.com/reown-com/appkit/pull/3637) [`40ef5c7`](https://github.com/reown-com/appkit/commit/40ef5c7b35e48a2271c27ae770b93061fa216d8a) Thanks [@zoruka](https://github.com/zoruka)! - Add default value if namespace is not available on upa getAccounts

- [#3721](https://github.com/reown-com/appkit/pull/3721) [`eade9f2`](https://github.com/reown-com/appkit/commit/eade9f28e41b608db0237be526d65742cf13e991) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes listening `ChainController.state.noAdapters` and `OptionsController.state.features` while enable/disable auth options dynamically

- [#3639](https://github.com/reown-com/appkit/pull/3639) [`489de7c`](https://github.com/reown-com/appkit/commit/489de7c77be40d8131b721d81cf89241fe5348b3) Thanks [@zoruka](https://github.com/zoruka)! - Fix BitcoinAdapter `switchNetwork` function execution

- [#3621](https://github.com/reown-com/appkit/pull/3621) [`7b4f03f`](https://github.com/reown-com/appkit/commit/7b4f03f24d853a514d26f5d6dcc1c2255c3573b3) Thanks [@tomiir](https://github.com/tomiir)! - Fetches native balance when on testnets

- [#3691](https://github.com/reown-com/appkit/pull/3691) [`4075214`](https://github.com/reown-com/appkit/commit/4075214027e183c04b29758628b2fca81a25b5dc) Thanks [@magiziz](https://github.com/magiziz)! - Expanded more views in the modal open function to include Swap, Send, Wallet Is a Wallet, Wallet Is a Network and All Wallets screens.

  **Example usage**

  ```tsx
  import { createAppKit } from '@reown/appkit'

  const VIEWS = [
    { label: 'Open "On-Ramp" modal view', view: 'Swap' },
    { label: 'Open "Send" modal view', view: 'WalletSend' },
    { label: 'Open "What Is a Wallet?" modal view', view: 'WhatIsAWallet' },
    { label: 'Open "What Is a Network?" modal view', view: 'WhatIsANetwork' },
    { label: 'Open "All Wallets" modal view', view: 'AllWallets' }
  ] as const

  const modal = createAppKit({
    adapters: [], // Add your adapters here
    networks: [], // Add your networks here
    projectId: 'YOUR_PROJECT_ID'
  })

  export function YourApp() {
    return (
      <>
        {VIEWS.map(({ label, view }) => (
          <button key={view} onClick={() => modal.open({ view })}>
            {label}
          </button>
        ))}
      </>
    )
  }
  ```

- [#3648](https://github.com/reown-com/appkit/pull/3648) [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where opening the modal without adapters would open regular connect WC screen

- [#3717](https://github.com/reown-com/appkit/pull/3717) [`72b14ce`](https://github.com/reown-com/appkit/commit/72b14ce20fdde3b0162e496756fdd96ac14ab901) Thanks [@zoruka](https://github.com/zoruka)! - Update @walletconnect packages to latest version.

- [#3640](https://github.com/reown-com/appkit/pull/3640) [`2935978`](https://github.com/reown-com/appkit/commit/293597872b31eecf7c4d04e0f875688f6c795af4) Thanks [@magiziz](https://github.com/magiziz)! - Added `createAppKitWalletButton` function to `@reown/appkit-wallet-button` package for easier implementation of the Wallet Button feature without relying solely on hooks.

  **Example usage**

  ```tsx
  import { useEffect, useState } from 'react'

  import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

  const appKitWalletButton = createAppKitWalletButton()

  export function YourApp() {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
      // Check if Wallet Buttons are ready
      if (appKitWalletButton.isReady()) {
        setIsReady(true)
      } else {
        // Subscribe to ready state changes
        appKitWalletButton.subscribeIsReady(state => {
          setIsReady(state.isReady)
        })
      }
    }, [appKitWalletButton])

    return (
      <>
        <button onClick={() => appKitWalletButton.connect('walletConnect')} disabled={!isReady}>
          Open QR modal
        </button>
        <button onClick={() => appKitWalletButton.connect('metamask')} disabled={!isReady}>
          Connect to MetaMask
        </button>{' '}
        <button onClick={() => appKitWalletButton.connect('google')} disabled={!isReady}>
          Connect to Google
        </button>
      </>
    )
  }
  ```

- [#3681](https://github.com/reown-com/appkit/pull/3681) [`20c608f`](https://github.com/reown-com/appkit/commit/20c608f30aef7df58b4da1bfb9d57967bfd0e46c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes redundant goBack call when switching to another namespace

- [#3611](https://github.com/reown-com/appkit/pull/3611) [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where appKit.getProvider() would not return correct provider.

- [#3716](https://github.com/reown-com/appkit/pull/3716) [`59f57f3`](https://github.com/reown-com/appkit/commit/59f57f356cd9887ce87e5877ec7561656eb32e43) Thanks [@tomiir](https://github.com/tomiir)! - Fetches native balance when API does not support it

- [#3679](https://github.com/reown-com/appkit/pull/3679) [`3305586`](https://github.com/reown-com/appkit/commit/3305586614d73fe9a3b71919c2b29c3b1568826b) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors AppKit client to handle syncBalance call for unsupported networks as expected

- [#3607](https://github.com/reown-com/appkit/pull/3607) [`a66de04`](https://github.com/reown-com/appkit/commit/a66de0442e6d421e8d0dcf875573ee49071bf891) Thanks [@zoruka](https://github.com/zoruka)! - Add defaultAccountTypes option for AppKit initialization.

- [#3682](https://github.com/reown-com/appkit/pull/3682) [`1ea9f7d`](https://github.com/reown-com/appkit/commit/1ea9f7d0b8a138376a10de7287cf0ed2254a7760) Thanks [@tomiir](https://github.com/tomiir)! - Prevents calls to Blockchain Api that would fail due to lack of support. Initialize supported list on AppKit initialization'

- [#3576](https://github.com/reown-com/appkit/pull/3576) [`68bdd14`](https://github.com/reown-com/appkit/commit/68bdd1476b85b0d47d70ef2fe35bf8c6eba3c74d) Thanks [@magiziz](https://github.com/magiziz)! - Added a loading indicator to the account button component when the balance has not been fetched.

- [#3635](https://github.com/reown-com/appkit/pull/3635) [`190fdb9`](https://github.com/reown-com/appkit/commit/190fdb9c6f5563df2095e808bbdffac1ae73aed6) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connectExternal to call switch network if wallet's active chain is not in requested networks list

- [#3663](https://github.com/reown-com/appkit/pull/3663) [`018c6f1`](https://github.com/reown-com/appkit/commit/018c6f1e87f4b5e0c14aff8c45b5713809defcc9) Thanks [@zoruka](https://github.com/zoruka)! - Remove all onUri callback drilling for all walletConnectConnect methods in favor of a single call when initializing the UniversalProvider

- [#3672](https://github.com/reown-com/appkit/pull/3672) [`98ad777`](https://github.com/reown-com/appkit/commit/98ad777c5de798ae549ad4bac10b6ced7cda18b1) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `walletProvider` from the `useAppKitProvider` hook was `undefined` when the wallet was connected. This issue occurred only when using wagmi adapter.

- [#3670](https://github.com/reown-com/appkit/pull/3670) [`25a97c6`](https://github.com/reown-com/appkit/commit/25a97c66fe47c2c1d19cf8bbf5c5474612cd6e7b) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where 1CA session would not be found because of non-cased addresses mismatching.'

- [#3715](https://github.com/reown-com/appkit/pull/3715) [`3accd43`](https://github.com/reown-com/appkit/commit/3accd437e21dcb9316cbe83e0bf9a8a3268ab7ce) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi connectors were not appearing in the connect modal

- [#3619](https://github.com/reown-com/appkit/pull/3619) [`7296a32`](https://github.com/reown-com/appkit/commit/7296a32b99bac546ab84555ca6a71b8838b61842) Thanks [@zoruka](https://github.com/zoruka)! - Refactor to add WalletConnectConnector as extensible class and remove replicated code around adapters

- [#3678](https://github.com/reown-com/appkit/pull/3678) [`1614ff6`](https://github.com/reown-com/appkit/commit/1614ff603d09fbfc9c2d70fc9a7c8cff33b98b46) Thanks [@tomiir](https://github.com/tomiir)! - Removes duplicated all wallets button on AppKit Core

- [#3680](https://github.com/reown-com/appkit/pull/3680) [`62b4369`](https://github.com/reown-com/appkit/commit/62b4369ade281bdd5bcb90791817283e20c678cc) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where onramp and activity were enabled in non-supported networks'

- [#3692](https://github.com/reown-com/appkit/pull/3692) [`5472c34`](https://github.com/reown-com/appkit/commit/5472c34fd3ad4328d8de347c65801718ff970d3b) Thanks [@magiziz](https://github.com/magiziz)! - Added an alert error if the analytics event fails with a forbidden status.

- [#3611](https://github.com/reown-com/appkit/pull/3611) [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac) Thanks [@tomiir](https://github.com/tomiir)! - Adds authProvider to embeddedWalletInfo in useAppKitAccount

- [#3714](https://github.com/reown-com/appkit/pull/3714) [`83d62d9`](https://github.com/reown-com/appkit/commit/83d62d98148fb5130a1698fdfa974db26cea66dc) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi adapter would emit disconnect event when user was not connected causing SIWE to break.

- [#3723](https://github.com/reown-com/appkit/pull/3723) [`a90474b`](https://github.com/reown-com/appkit/commit/a90474bec8d791d27dc0bec542f57193945b9e63) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where multichain social/email login was not working

- Updated dependencies [[`427dde3`](https://github.com/reown-com/appkit/commit/427dde3cfb3bcb8a61d22b3732150c39958483e8), [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f), [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a), [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a), [`86e7510`](https://github.com/reown-com/appkit/commit/86e75103084d6babdb0d0bb8afbbe30199fb3dde), [`40ef5c7`](https://github.com/reown-com/appkit/commit/40ef5c7b35e48a2271c27ae770b93061fa216d8a), [`eade9f2`](https://github.com/reown-com/appkit/commit/eade9f28e41b608db0237be526d65742cf13e991), [`489de7c`](https://github.com/reown-com/appkit/commit/489de7c77be40d8131b721d81cf89241fe5348b3), [`7b4f03f`](https://github.com/reown-com/appkit/commit/7b4f03f24d853a514d26f5d6dcc1c2255c3573b3), [`4075214`](https://github.com/reown-com/appkit/commit/4075214027e183c04b29758628b2fca81a25b5dc), [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f), [`72b14ce`](https://github.com/reown-com/appkit/commit/72b14ce20fdde3b0162e496756fdd96ac14ab901), [`2935978`](https://github.com/reown-com/appkit/commit/293597872b31eecf7c4d04e0f875688f6c795af4), [`20c608f`](https://github.com/reown-com/appkit/commit/20c608f30aef7df58b4da1bfb9d57967bfd0e46c), [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac), [`59f57f3`](https://github.com/reown-com/appkit/commit/59f57f356cd9887ce87e5877ec7561656eb32e43), [`3305586`](https://github.com/reown-com/appkit/commit/3305586614d73fe9a3b71919c2b29c3b1568826b), [`a66de04`](https://github.com/reown-com/appkit/commit/a66de0442e6d421e8d0dcf875573ee49071bf891), [`1ea9f7d`](https://github.com/reown-com/appkit/commit/1ea9f7d0b8a138376a10de7287cf0ed2254a7760), [`68bdd14`](https://github.com/reown-com/appkit/commit/68bdd1476b85b0d47d70ef2fe35bf8c6eba3c74d), [`190fdb9`](https://github.com/reown-com/appkit/commit/190fdb9c6f5563df2095e808bbdffac1ae73aed6), [`018c6f1`](https://github.com/reown-com/appkit/commit/018c6f1e87f4b5e0c14aff8c45b5713809defcc9), [`98ad777`](https://github.com/reown-com/appkit/commit/98ad777c5de798ae549ad4bac10b6ced7cda18b1), [`25a97c6`](https://github.com/reown-com/appkit/commit/25a97c66fe47c2c1d19cf8bbf5c5474612cd6e7b), [`3accd43`](https://github.com/reown-com/appkit/commit/3accd437e21dcb9316cbe83e0bf9a8a3268ab7ce), [`7296a32`](https://github.com/reown-com/appkit/commit/7296a32b99bac546ab84555ca6a71b8838b61842), [`1614ff6`](https://github.com/reown-com/appkit/commit/1614ff603d09fbfc9c2d70fc9a7c8cff33b98b46), [`62b4369`](https://github.com/reown-com/appkit/commit/62b4369ade281bdd5bcb90791817283e20c678cc), [`5472c34`](https://github.com/reown-com/appkit/commit/5472c34fd3ad4328d8de347c65801718ff970d3b), [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac), [`83d62d9`](https://github.com/reown-com/appkit/commit/83d62d98148fb5130a1698fdfa974db26cea66dc)]:
  - @reown/appkit@1.6.5
  - @reown/appkit-common@1.6.5
  - @reown/appkit-core@1.6.5

## 1.6.4

### Patch Changes

- [#3579](https://github.com/reown-com/appkit/pull/3579) [`8ddfbf2`](https://github.com/reown-com/appkit/commit/8ddfbf227ba8bc39c7b4071c328568e9ab365b87) Thanks [@magiziz](https://github.com/magiziz)! - Added an error message for when the user provides an invalid project id.

- [#3562](https://github.com/reown-com/appkit/pull/3562) [`fbafcea`](https://github.com/reown-com/appkit/commit/fbafcea4038d0644fd9c84e05a15990b11707b9a) Thanks [@tomiir](https://github.com/tomiir)! - Sets secure site version to 3.
  Handles case where Magic SDK connection fizzled, causing magic to connected while AppKit believed it was not connected

- [#3564](https://github.com/reown-com/appkit/pull/3564) [`6284eb1`](https://github.com/reown-com/appkit/commit/6284eb190de3eda2fcf04848f0fb10aee7921b13) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the balance endpoint was being called every 30 seconds for unsupported networks.

- [#3575](https://github.com/reown-com/appkit/pull/3575) [`37901c6`](https://github.com/reown-com/appkit/commit/37901c6d6fa64108a8c40a99fc7973e8b8f0d4b2) Thanks [@enesozturk](https://github.com/enesozturk)! - Exposes publicKey and path for bitcoin connectors in allAccounts

- [#3596](https://github.com/reown-com/appkit/pull/3596) [`150cdb6`](https://github.com/reown-com/appkit/commit/150cdb6ebc7f4befd56fc6438ce57f09a887096f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds client check for the methods in bitcoin connectors for ssr issues

- [#3560](https://github.com/reown-com/appkit/pull/3560) [`83635a4`](https://github.com/reown-com/appkit/commit/83635a42c57896580ba69aeffd527481868047b0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where closing the modal mid embedded wallet request would not abort the request

- [#3568](https://github.com/reown-com/appkit/pull/3568) [`87029c0`](https://github.com/reown-com/appkit/commit/87029c0662567dd658f0e204a07eb67f08e3c813) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where only wallets from the initially active chain ID would be fetched. Re-fetches wallets from API when network changes.

- [#3563](https://github.com/reown-com/appkit/pull/3563) [`35a4f56`](https://github.com/reown-com/appkit/commit/35a4f564ef273b7840e8148d286755a587bb04b8) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the modal didn't close after completing login if users navigated between different social login options.

- [#3583](https://github.com/reown-com/appkit/pull/3583) [`34ed47e`](https://github.com/reown-com/appkit/commit/34ed47e9542b183463777caf096fd44ea8eb0816) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where swap button shows an infinite spinner

- [#3573](https://github.com/reown-com/appkit/pull/3573) [`d9a96a5`](https://github.com/reown-com/appkit/commit/d9a96a5bfd8e358e73c8b4cfb9efb09efcbe8f1b) Thanks [@magiziz](https://github.com/magiziz)! - Added a new `required` option to SIWE/SIWX. This option determines whether the wallet stays connected when the user denies the signature request. If set to `true` it will disconnect the wallet and close the modal. If set to `false` it will close the modal without disconnecting the wallet.

  **Example usage**

  ```ts
  import { createSIWEConfig } from '@reown/appkit-siwe'
  import type { SIWECreateMessageArgs, SIWEVerifyMessageArgs } from '@reown/appkit-siwe'

  export const siweConfig = createSIWEConfig({
    required: false, // Optional - defaults to true
    getMessageParams: async () => {
      // Return message parameters
    },
    createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
      // Return formatted message
    },
    getNonce: async () => {
      // Return nonce
    },
    getSession: async () => {
      // Return session
    },
    verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
      // Verify message
    },
    signOut: async () => {
      // Sign out
    }
  })
  ```

- [#3586](https://github.com/reown-com/appkit/pull/3586) [`d5b811c`](https://github.com/reown-com/appkit/commit/d5b811c666e41846fd5798116e7c93606b4b992f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds add/remove adapter methods to appkit client, moves active connector state to connected connector

- [#3565](https://github.com/reown-com/appkit/pull/3565) [`93cee5c`](https://github.com/reown-com/appkit/commit/93cee5c44e6f30f3594bc7c5a4029dc1f05503f1) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where users with an ENS couldn't copy their address.

- [#3590](https://github.com/reown-com/appkit/pull/3590) [`56d82e8`](https://github.com/reown-com/appkit/commit/56d82e8b04fb49d586f65f6e20fdd788e83000d5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi did not reconnect on page reload

- [#3584](https://github.com/reown-com/appkit/pull/3584) [`7703d40`](https://github.com/reown-com/appkit/commit/7703d409b6107c7fd61228fc1f1576d1b8503ce5) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where status would not be set for non-connected namespaces. Make syncExistingConnection call syncNamespaceConnection for non-connected namespaces as well, resulting in status being set correctly'

- [#3554](https://github.com/reown-com/appkit/pull/3554) [`7a7df99`](https://github.com/reown-com/appkit/commit/7a7df99625721759f2b426e6d8c3d1b13749a2cb) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix farcaster issue, so user can see their correct username in account view

- [#3555](https://github.com/reown-com/appkit/pull/3555) [`3ee19a2`](https://github.com/reown-com/appkit/commit/3ee19a227540bb496aa1b319d64f0306a82ce5dd) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - add create subscription method

- [#3558](https://github.com/reown-com/appkit/pull/3558) [`a48e2f9`](https://github.com/reown-com/appkit/commit/a48e2f9067bdbe85b87ff1d720cb898dbc0ed3cd) Thanks [@magiziz](https://github.com/magiziz)! - Added embedded wallet info to `useAppKitAccount` hook.

  **Example usage**

  ```tsx
  import { useAppKitAccount } from '@reown/appkit/react'

  export function YourApp() {
    const { embeddedWalletInfo } = useAppKitAccount()

    const email = embeddedWalletInfo.user?.email

    return email && <p>Email address: {email}</p>
  }
  ```

- [#3592](https://github.com/reown-com/appkit/pull/3592) [`14d6281`](https://github.com/reown-com/appkit/commit/14d62819e178e8ccf9f76c3a0c5fb16e21db52e3) Thanks [@tomiir](https://github.com/tomiir)! - Fixed issue where balance would not be properly synced due to not finding correct chainId or pointing to other tokens in portfolio instead of native token

- Updated dependencies [[`8ddfbf2`](https://github.com/reown-com/appkit/commit/8ddfbf227ba8bc39c7b4071c328568e9ab365b87), [`fbafcea`](https://github.com/reown-com/appkit/commit/fbafcea4038d0644fd9c84e05a15990b11707b9a), [`6284eb1`](https://github.com/reown-com/appkit/commit/6284eb190de3eda2fcf04848f0fb10aee7921b13), [`37901c6`](https://github.com/reown-com/appkit/commit/37901c6d6fa64108a8c40a99fc7973e8b8f0d4b2), [`150cdb6`](https://github.com/reown-com/appkit/commit/150cdb6ebc7f4befd56fc6438ce57f09a887096f), [`83635a4`](https://github.com/reown-com/appkit/commit/83635a42c57896580ba69aeffd527481868047b0), [`87029c0`](https://github.com/reown-com/appkit/commit/87029c0662567dd658f0e204a07eb67f08e3c813), [`35a4f56`](https://github.com/reown-com/appkit/commit/35a4f564ef273b7840e8148d286755a587bb04b8), [`34ed47e`](https://github.com/reown-com/appkit/commit/34ed47e9542b183463777caf096fd44ea8eb0816), [`d9a96a5`](https://github.com/reown-com/appkit/commit/d9a96a5bfd8e358e73c8b4cfb9efb09efcbe8f1b), [`d5b811c`](https://github.com/reown-com/appkit/commit/d5b811c666e41846fd5798116e7c93606b4b992f), [`93cee5c`](https://github.com/reown-com/appkit/commit/93cee5c44e6f30f3594bc7c5a4029dc1f05503f1), [`56d82e8`](https://github.com/reown-com/appkit/commit/56d82e8b04fb49d586f65f6e20fdd788e83000d5), [`7703d40`](https://github.com/reown-com/appkit/commit/7703d409b6107c7fd61228fc1f1576d1b8503ce5), [`7a7df99`](https://github.com/reown-com/appkit/commit/7a7df99625721759f2b426e6d8c3d1b13749a2cb), [`3ee19a2`](https://github.com/reown-com/appkit/commit/3ee19a227540bb496aa1b319d64f0306a82ce5dd), [`a48e2f9`](https://github.com/reown-com/appkit/commit/a48e2f9067bdbe85b87ff1d720cb898dbc0ed3cd), [`14d6281`](https://github.com/reown-com/appkit/commit/14d62819e178e8ccf9f76c3a0c5fb16e21db52e3)]:
  - @reown/appkit@1.6.4
  - @reown/appkit-common@1.6.4
  - @reown/appkit-core@1.6.4

## 1.6.3

### Patch Changes

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Updated account modal to redirect to the settings view instead of the profile view when only one social/email account is connected

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Added a new option to enable or disable logs from email/social login.

  **Example usage**

  ```ts
  import { createAppKit } from '@reown/appkit/react'

  const modal = createAppKit({
    adapters: [
      /* Adapters */
    ],
    networks: [
      /* Networks */
    ],
    projectId: 'YOUR_PROJECT_ID',
    enableAuthLogger: false // Optional - defaults to true
  })
  ```

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes `signOutOnNetworkChange` and `signOutOnAccountChange` flags on SIWX mapper function to work as expected

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue with WC connections on wallets that do not support a requested network. Sets default network to first one supported by wallet

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Improves existing connection error handling'

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixed an issue where disconnecting the injected wallet did not update the state as disconnected for ethers/ethers5 adapters

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds loading while disconnecting

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue where refreshing the page when connected to multiple namespaces would only reconnect the last active one

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes Vue hooks to return reactive values

- [#3527](https://github.com/reown-com/appkit/pull/3527) [`f045fb5`](https://github.com/reown-com/appkit/commit/f045fb5c4703f1661d1701ce898945acd73a97f9) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - fix reload iframe after aborting farcaster

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixed an issue where an incorrect EOA label and icon were displayed in the profile view after reconnecting through social/email login

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Set connected wallet info when going to authenticate flow.

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates @solana/web3.js dependency to latest

- Updated dependencies [[`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`f045fb5`](https://github.com/reown-com/appkit/commit/f045fb5c4703f1661d1701ce898945acd73a97f9), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c)]:
  - @reown/appkit@1.6.3
  - @reown/appkit-common@1.6.3
  - @reown/appkit-core@1.6.3

## 1.6.2

### Patch Changes

- [#3509](https://github.com/reown-com/appkit/pull/3509) [`0926b4d`](https://github.com/reown-com/appkit/commit/0926b4d7286ce82d58e2acd85b108f69c8823867) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where accounts were not correctly set

- [#3516](https://github.com/reown-com/appkit/pull/3516) [`04208c8`](https://github.com/reown-com/appkit/commit/04208c86b4b2ce6621561b121a8a620687a58728) Thanks [@zoruka](https://github.com/zoruka)! - Add unit testing for Bitcoin adapter and fix unused default values

- [#3514](https://github.com/reown-com/appkit/pull/3514) [`15bfe49`](https://github.com/reown-com/appkit/commit/15bfe4963087e3002df989f497a18a7d126c8c72) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the `pendingTransactions` event was being emitted infinitely in wagmi adapter.

  Additionally another option was added to wagmi adapter called `pendingTransactionsFilter`.

  **Example usage**

  ```ts
  const wagmiAdapter = new WagmiAdapter({
    networks: [
      /* Your Networks */
    ],
    projectId: 'YOUR_PROJECT_ID',
    pendingTransactionsFilter: {
      enable: true,
      pollingInterval: 15_000
    }
  })

  createAppKit({
    adapters: [wagmiAdapter],
    networks: [
      /* Your Networks */
    ],
    projectId: 'YOUR_PROJECT_ID'
  })
  ```

- Updated dependencies [[`0a8ead2`](https://github.com/reown-com/appkit/commit/0a8ead262ee0a2e0c116b1eaeb80fd5086d0298f), [`0926b4d`](https://github.com/reown-com/appkit/commit/0926b4d7286ce82d58e2acd85b108f69c8823867), [`04208c8`](https://github.com/reown-com/appkit/commit/04208c86b4b2ce6621561b121a8a620687a58728), [`15bfe49`](https://github.com/reown-com/appkit/commit/15bfe4963087e3002df989f497a18a7d126c8c72)]:
  - @reown/appkit@1.6.2
  - @reown/appkit-common@1.6.2
  - @reown/appkit-core@1.6.2

## 1.6.1

### Patch Changes

- [#3505](https://github.com/reown-com/appkit/pull/3505) [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d) Thanks [@tomiir](https://github.com/tomiir)! - Makes bitcoin adapter public

- Updated dependencies [[`ee9b40e`](https://github.com/reown-com/appkit/commit/ee9b40e0bc7018a6c76199a3285a418356d90759), [`f83d09c`](https://github.com/reown-com/appkit/commit/f83d09c94e810d4abe830c6065f905b9237ef120), [`edc7a17`](https://github.com/reown-com/appkit/commit/edc7a17879fa54c1257aa985c833ce48af9c2144), [`e5a09bc`](https://github.com/reown-com/appkit/commit/e5a09bc20844b0e010a273eff12c3a31ca74c220), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`85c858f`](https://github.com/reown-com/appkit/commit/85c858f7191d6210b0ef900fb4fb1112b09f466c), [`3cf3bc5`](https://github.com/reown-com/appkit/commit/3cf3bc5501f64eb7f569716398d45fc8fa89a771), [`92ef6c4`](https://github.com/reown-com/appkit/commit/92ef6c4bfe56c67eedfcf6060ccbf87891ce3468), [`e18eefe`](https://github.com/reown-com/appkit/commit/e18eefe339aab5d02743faee26b0aac0f624b678), [`7b91225`](https://github.com/reown-com/appkit/commit/7b9122520b2ed0cf5d7a4fb0b160bfa4c23c2b58), [`444d1dd`](https://github.com/reown-com/appkit/commit/444d1dd2c6216f47bcf32c98551e5c4338d872c5), [`0f55885`](https://github.com/reown-com/appkit/commit/0f55885520775652ae7bc42b83e20b03d3b4ad31), [`ce5207f`](https://github.com/reown-com/appkit/commit/ce5207f902d3257d0780e6ae78dfe25e5a870a01), [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`11b3e2e`](https://github.com/reown-com/appkit/commit/11b3e2ed386eb0fa4ccc203fb6b83459a188b5d2), [`8fa4632`](https://github.com/reown-com/appkit/commit/8fa46321ef6cb265423cc9b2dc9369de461cbbfc), [`56b66f4`](https://github.com/reown-com/appkit/commit/56b66f4cb60dc7fd9b72c2cb85b434f7f2917871), [`14af422`](https://github.com/reown-com/appkit/commit/14af422e7eee14a13601e903dee61655485babd9), [`a737ca3`](https://github.com/reown-com/appkit/commit/a737ca3b20714a0c89fc6620ce1fed3602a02796), [`69fcf27`](https://github.com/reown-com/appkit/commit/69fcf27c56db900554eacced0b1725c3060ed781), [`fccbd31`](https://github.com/reown-com/appkit/commit/fccbd31be0a6ed550468f2049413ee7cdf0d64b8), [`a9d7686`](https://github.com/reown-com/appkit/commit/a9d7686eac8a95d8a1235504a302e8ae153ebf5d), [`8249314`](https://github.com/reown-com/appkit/commit/824931426721b02e4cc7474066f54916aaf29dcf), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`ea1067a`](https://github.com/reown-com/appkit/commit/ea1067aff3086c68dfe5f4f33eac5fb6b882bbde), [`c1a641f`](https://github.com/reown-com/appkit/commit/c1a641fb5cc34f84d97535006d698efd3e563036)]:
  - @reown/appkit@1.6.1
  - @reown/appkit-core@1.6.1
  - @reown/appkit-common@1.6.1
