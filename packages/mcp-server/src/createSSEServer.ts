import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from 'express'

export function createSSEServer(mcpServer: McpServer) {
  const app = express()

  // Add CORS middleware
  // @ts-ignore
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    next()
  })

  const transportMap = new Map<string, SSEServerTransport>()

  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/messages', res)
    transportMap.set(transport.sessionId, transport)
    await mcpServer.connect(transport)
  })

  app.get('/ping', (_, res) => {
    res.status(200).json({ message: 'pong' })
  })

  app.post('/messages', (req, res) => {
    const sessionId = req.query.sessionId as string
    if (!sessionId) {
      console.error('Message received without sessionId')
      res.status(400).json({ error: 'sessionId is required' })
      return
    }

    const transport = transportMap.get(sessionId)

    if (transport) {
      transport.handlePostMessage(req, res)
    }
  })

  return app
}
