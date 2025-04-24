import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

import { getBalanceTool } from './src/tools/balance.js'
import { getEnsLookupTool } from './src/tools/ensLookup.js'
import { getEnsReverseLookupTool } from './src/tools/ensReverseLookup.js'
import { getEnsFetchIdentityTool } from './src/tools/fetchIdentity.js'
import { getGasPriceTool } from './src/tools/gasPrice.js'
import { getGenerateOnrampURLTool } from './src/tools/generateOnrampURL.js'
import { getTransactionHistoryTool } from './src/tools/history.js'
import { nextJsWagmiAppRouterSampleApp } from './src/tools/sampleApps.js'
import { getSendTool } from './src/tools/send.js'
import { getSwapTool } from './src/tools/swap.js'

// Initialize BlockchainApiClient with project ID from CLI parameter
export const blockchainApiClient = new BlockchainApiClient({
  projectId: '44e8bb29da4ab857e0803291a8eda35a',
  sdkType: 'appkit',
  sdkVersion: 'html-wagmi-1.7.0'
})

export const server = new McpServer({
  name: 'Reown',
  version: '1.0.0'
})

// Register all tools
getBalanceTool(server, blockchainApiClient)
getEnsFetchIdentityTool(server, blockchainApiClient)
getTransactionHistoryTool(server, blockchainApiClient)
getGasPriceTool(server, blockchainApiClient)
getEnsLookupTool(server, blockchainApiClient)
getEnsReverseLookupTool(server, blockchainApiClient)
getGenerateOnrampURLTool(server, blockchainApiClient)
getSwapTool(server)
getSendTool(server)

// Resources
nextJsWagmiAppRouterSampleApp(server)
