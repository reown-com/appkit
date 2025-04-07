import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

export const getGasPriceTool = (server: McpServer, client: BlockchainApiClient) =>
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
        const gasPrice = await client.fetchGasPrice({ chainId })

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
