import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { server } from '../src/server.js'

async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Reown MCP Server running on stdio')
}

export function startServer() {
  runServer().catch(error => {
    console.error('Fatal error in main():', error)
    process.exit(1)
  })
}
