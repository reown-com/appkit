import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { blockchainApiClient } from '../api-client.js'

export const getEnsLookupTool = (server: McpServer) =>
  server.tool(
    'ensLookup',
    'Lookup an ENS name to get the address of the owner',
    {
      name: z.string().describe('The ENS name to lookup (e.g. "vitalik.eth")')
    },
    async ({ name }) => {
      try {
        const data = await blockchainApiClient.lookupEnsName(name)

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
