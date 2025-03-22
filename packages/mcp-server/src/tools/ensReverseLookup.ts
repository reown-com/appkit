import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { BlockchainApiClient } from '@reown/appkit-blockchain-api'

export const getEnsReverseLookupTool = (server: McpServer, client: BlockchainApiClient) =>
  server.tool(
    'ensReverseLookup',
    {
      address: z.string().describe('The address to find ENS names for')
    },
    async ({ address }) => {
      try {
        const ensNames = await client.reverseLookupEnsName({ address })

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
