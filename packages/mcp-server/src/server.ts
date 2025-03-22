import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import 'dotenv/config'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

import { getBalanceTool } from './tools/balance.js'
import { getEnsLookupTool } from './tools/ensLookup.js'
import { getEnsReverseLookupTool } from './tools/ensReverseLookup.js'
import { getEnsFetchIdentityTool } from './tools/fetchIdentity.js'
import { getGasPriceTool } from './tools/gasPrice.js'
import { getGenerateOnrampURLTool } from './tools/generateOnrampURL.js'
import { getTransactionHistoryTool } from './tools/history.js'
import { getSendTool } from './tools/send.js'
import { getSwapTool } from './tools/swap.js'

// Initialize BlockchainApiClient with project ID from environment variables
export const blockchainApiClient = new BlockchainApiClient({
  projectId: process.env.PROJECT_ID || 'e70dca6ace32dc542f1ddeab132dd020', // Fallback to default if not provided
  sdkType: 'appkit',
  sdkVersion: 'html-wagmi-1.7.0'
})

export const server = new McpServer({
  name: 'AppKit',
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
