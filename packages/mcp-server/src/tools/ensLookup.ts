import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

export const getEnsLookupTool = (server: McpServer, client: BlockchainApiClient) =>
  server.tool(
    'ensLookup',
    {
      name: z.string().describe('The ENS name to lookup (e.g. "vitalik.eth")')
    },
    async ({ name }) => {
      try {
        const data = await client.lookupEnsName(name)

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 1)
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Error looking up ENS name - ${(error as Error)?.message}` }
          ]
        }
      }
    }
  )
