import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { type CaipNetworkId } from '@reown/appkit-common'

import { blockchainApiClient } from '../api-client.js'

export const getEnsFetchIdentityTool = (server: McpServer) =>
  server.tool(
    'fetchIdentity',
    'Fetch the identity of an address on a specific network. Returns the avatar and ENS name of the address.',
    {
      address: z.string().describe('The address to get the identity for'),
      chainId: z.string().describe('The chain ID (e.g. "1" for Ethereum mainnet)')
    },
    async ({ address, chainId }) => {
      try {
        const caipNetworkId = `eip155:${chainId}` as CaipNetworkId
        const identity = await blockchainApiClient.fetchIdentity({ address, caipNetworkId })

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(identity, null, 1)
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Error fetching identity - ${(error as Error)?.message}` }
          ]
        }
      }
    }
  )
