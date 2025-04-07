import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

export const getBalanceTool = (server: McpServer, client: BlockchainApiClient) =>
  server.tool(
    'getBalance',
    'Get the owned tokens of an address on a specific network. Returns a list of tokens with name, symbol, amount, value, price, and icon url etc.',
    {
      address: z.string().describe('The address to get the balance of'),
      chainId: z.string().describe('The chain ID of the network to get the balance from')
    },
    async ({ address, chainId }) => {
      try {
        const data = await client.getBalance(address, chainId)

        // Format the balances for better readability
        const formattedBalances = data.balances.map(balance => ({
          name: balance.name,
          symbol: balance.symbol,
          amount: balance.quantity.numeric,
          value: balance.value,
          price: balance.price,
          iconUrl: balance.iconUrl
        }))

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formattedBalances, null, 1)
            }
          ]
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error getting balance - ${(error as Error)?.message}` }]
        }
      }
    }
  )
