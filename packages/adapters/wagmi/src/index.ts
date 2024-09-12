import '@reown/appkit-polyfills'

export { EVMWagmiClient } from './client.js'

// -- Types
export type { AdapterOptions } from './client.js'

// -- Connectors
export { authConnector } from './connectors/AuthConnector.js'

// -- Utils
export { convertToAppKitChains } from './utils/helpers.js'
