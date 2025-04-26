import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { blockchainApiClient } from '../api-client.js'

export const getGasPriceTool = (server: McpServer) =>
  server.tool(
    'fetchGasPrice',
    'Fetch the current gas price for a specific network. Returns the gas price in wei with standard, fast, and instant options.',
    {
      chainId: z
        .string()
        .describe('The chain ID to get gas price for (e.g. "1" for Ethereum mainnet)')
    },
    async ({ chainId }) => {
      try {
        const gasPrice = await blockchainApiClient.fetchGasPrice({ chainId })

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(gasPrice, null, 1)
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Error fetching gas price: ${(error as Error)?.message}` }
          ]
        }
      }
    }
  )
