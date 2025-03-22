import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

export const getTransactionHistoryTool = (server: McpServer, client: BlockchainApiClient) =>
  server.tool(
    'transactionHistory',
    {
      address: z.string().describe('The account address to get transaction history for'),
      chainId: z.string().optional().describe('The chain ID to filter transactions'),
      cursor: z.string().optional().describe('Pagination cursor for fetching next page of results')
    },
    async ({ address, chainId, cursor }) => {
      try {
        const transactions = await client.fetchTransactions({
          account: address,
          chainId,
          cursor
        })

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(transactions, null, 1)
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching transaction history: ${(error as Error)?.message}`
            }
          ]
        }
      }
    }
  )
