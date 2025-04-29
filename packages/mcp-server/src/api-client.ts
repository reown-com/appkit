import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

// Initialize BlockchainApiClient with project ID from CLI parameter
export const blockchainApiClient = new BlockchainApiClient({
  projectId: '44e8bb29da4ab857e0803291a8eda35a',
  sdkType: 'appkit',
  sdkVersion: 'html-wagmi-1.7.0'
})
