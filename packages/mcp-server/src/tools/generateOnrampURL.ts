import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

export const getGenerateOnrampURLTool = (server: McpServer, client: BlockchainApiClient) =>
  server.tool(
    'generateOnrampURL',
    {
      address: z.string().describe('The destination wallet address'),
      blockchains: z
        .array(z.string())
        .describe('List of blockchains to support (e.g. ["ethereum", "polygon"])'),
      partnerUserId: z
        .string()
        .optional()
        .describe('Unique ID for the user (defaults to wallet address)'),
      defaultNetwork: z.string().optional().describe('Default network to use'),
      purchaseAmount: z.number().optional().describe('Preset crypto amount to purchase'),
      paymentAmount: z.number().optional().describe('Preset fiat amount to spend')
    },
    async ({
      address,
      blockchains,
      partnerUserId,
      defaultNetwork,
      purchaseAmount,
      paymentAmount
    }) => {
      try {
        const url = await client.generateOnRampURL({
          destinationWallets: [{ address, blockchains, assets: [] }],
          partnerUserId: partnerUserId || address,
          defaultNetwork,
          purchaseAmount,
          paymentAmount
        })

        return {
          content: [
            {
              type: 'text',
              text: url
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Error generating on-ramp URL: ${(error as Error)?.message}` }
          ]
        }
      }
    }
  )
