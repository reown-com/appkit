export type { ConfigOptions } from '@web3modal/core'
// -- components ------------------------------------------------- /
export { AccountButton } from './src/components/AccountButton'
export { ConnectButton } from './src/components/ConnectButton'
export { Web3Modal } from './src/components/Web3Modal'
// -- hooks ------------------------------------------------------ /
export { useAccount } from './src/hooks/data/useAccount'
export { useBlockNumber } from './src/hooks/data/useBlockNumber'
export { useNetwork } from './src/hooks/data/useNetwork'
export { useProvider } from './src/hooks/data/useProvider'
export { useWebsocketProvider } from './src/hooks/data/useWebsocketProvider'
export { useConnectModal } from './src/hooks/modal/useConnectModal'
