/**
 * WARNING
 * The `w3m-modal` component will be imported dynamically in the Scaffold's client code.
 * That's why it requires it's own path to be imported that separately. To do this, we are creating sub-exports for the `w3m-modal` component specifically.
 * Make sure you're not exporting w3m-modal here.
 */

// -- Modal Components ---------------------------------- //
export * from '../src/modal/w3m-account-button/index.js'
export * from '../src/modal/w3m-button/index.js'
export * from '../src/modal/w3m-connect-button/index.js'
export * from '../src/modal/w3m-network-button/index.js'
export * from '../src/modal/w3m-router/index.js'

// -- Views --------------------------------------------- //

// Account
export * from '../src/views/w3m-account-settings-view/index.js'
export * from '../src/views/w3m-account-view/index.js'
export * from '../src/views/w3m-profile-wallets-view/index.js'

// Connection
export * from '../src/views/w3m-all-wallets-view/index.js'
export * from '../src/views/w3m-connect-view/index.js'
export * from '../src/views/w3m-connecting-external-view/index.js'
export * from '../src/views/w3m-connecting-multi-chain-view/index.js'
export * from '../src/views/w3m-connecting-wc-view/index.js'
export * from '../src/views/w3m-connecting-wc-basic-view/index.js'
export * from '../src/views/w3m-choose-account-name-view/index.js'
export * from '../src/views/w3m-downloads-view/index.js'
export * from '../src/views/w3m-get-wallet-view/index.js'
export * from '../src/views/w3m-what-is-a-wallet-view/index.js'
export * from '../src/views/w3m-connect-wallets-view/index.js'

// Network
export * from '../src/views/w3m-network-switch-view/index.js'
export * from '../src/views/w3m-networks-view/index.js'
export * from '../src/views/w3m-switch-active-chain-view/index.js'
export * from '../src/views/w3m-what-is-a-network-view/index.js'
export * from '../src/views/w3m-unsupported-chain-view/index.js'
export * from '../src/views/w3m-wallet-compatible-networks-view/index.js'

// TOD0: SPLIT SIWX
export * from '../src/views/w3m-siwx-sign-message-view/index.js'
