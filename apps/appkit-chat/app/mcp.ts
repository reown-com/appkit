import {
  getBalanceTool,
  getEnsFetchIdentityTool,
  getEnsLookupTool,
  getEnsReverseLookupTool,
  getGasPriceTool,
  getGenerateOnrampURLTool,
  getSendTool,
  getTransactionHistoryTool
} from '@reown/mcp-server'

import { initializeMcpApiHandler } from '../lib/mcp-api-handler'

export const mcpHandler = initializeMcpApiHandler(server => {
  getBalanceTool(server)
  getEnsLookupTool(server)
  getEnsReverseLookupTool(server)
  getEnsFetchIdentityTool(server)
  getGasPriceTool(server)
  getGenerateOnrampURLTool(server)
  getTransactionHistoryTool(server)
  getSendTool(server)
})
