import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

export const getSendTool = (server: McpServer) =>
  server.tool(
    'send',
    'Send a token to a specific address on a specific network. Returns a URL that will let user to perform the send transaction with AppKit.',
    {
      sourceToken: z.string().describe('The token to send (token symbol)'),
      amount: z.string().describe('The amount to send'),
      receiverAddress: z.string().describe('The address to send tokens to'),
      chainId: z.string().describe('The network to make the transfer in (e.g., 137 for Polygon)')
    },
    async ({ sourceToken, amount, receiverAddress, chainId }) => {
      try {
        const sendUrl = new URL('http://localhost:3003/')
        sendUrl.searchParams.append('action', 'send')
        sendUrl.searchParams.append('sourceToken', sourceToken)
        sendUrl.searchParams.append('amount', amount)
        sendUrl.searchParams.append('address', receiverAddress)
        sendUrl.searchParams.append('chainId', chainId)

        return {
          content: [
            {
              type: 'text',
              text: `Here's your send URL: ${sendUrl}`
            }
          ]
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: 'Error generating send URL' }]
        }
      }
    }
  )
