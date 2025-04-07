import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import 'dotenv/config'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

import { getBalanceTool } from './tools/balance'
import { getEnsLookupTool } from './tools/ensLookup'
import { getEnsReverseLookupTool } from './tools/ensReverseLookup'
import { getEnsFetchIdentityTool } from './tools/fetchIdentity'
import { getGasPriceTool } from './tools/gasPrice'
import { getGenerateOnrampURLTool } from './tools/generateOnrampURL'
import { getTransactionHistoryTool } from './tools/history'
import { getSendTool } from './tools/send'
import { getSwapTool } from './tools/swap'

// Initialize BlockchainApiClient with project ID from environment variables
export const blockchainApiClient = new BlockchainApiClient({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
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
