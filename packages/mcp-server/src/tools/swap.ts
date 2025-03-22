import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import 'dotenv/config'
import { z } from 'zod'

export const getSwapTool = (server: McpServer) =>
  server.tool(
    'swap',
    {
      toToken: z.string().describe('The token to swap to (token symbol)'),
      sourceToken: z.string().describe('The token to swap from (token symbol)'),
      amount: z.string().describe('The amount to swap'),
      chainId: z.string().describe('The network to make the swap in (e.g., 137 for Polygon)')
    },
    async ({ toToken, sourceToken, amount, chainId }) => {
      try {
        // Construct the swap URL with the given parameters
        const swapUrl = new URL('http://localhost:3003/')
        swapUrl.searchParams.append('action', 'swap')
        swapUrl.searchParams.append('toToken', toToken)
        swapUrl.searchParams.append('sourceToken', sourceToken)
        swapUrl.searchParams.append('amount', amount)
        swapUrl.searchParams.append('chainId', chainId)

        return {
          content: [
            {
              type: 'text',
              text: `Here's your swap URL: ${swapUrl}`
            }
          ]
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: 'Error generating swap URL' }]
        }
      }
    }
  )
