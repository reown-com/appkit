import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { blockchainApiClient } from '../api-client.js'

export const getEnsReverseLookupTool = (server: McpServer) =>
  server.tool(
    'ensReverseLookup',
    'Find ENS names for an address. Returns a list of ENS names.',
    {
      address: z.string().describe('The address to find ENS names for')
    },
    async ({ address }) => {
      try {
        const ensNames = await blockchainApiClient.reverseLookupEnsName({ address })

        if (ensNames.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No ENS names found for address ${address}`
              }
            ]
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ensNames, null, 1)
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error performing ENS reverse lookup - ${(error as Error)?.message}`
            }
          ]
        }
      }
    }
  )
