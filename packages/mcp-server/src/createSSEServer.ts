import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from 'express'

export function createSSEServer(mcpServer: McpServer) {
  const app = express()

  const transportMap = new Map<string, SSEServerTransport>()

  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/messages', res)
    transportMap.set(transport.sessionId, transport)
    await mcpServer.connect(transport)
  })

  app.get('/ping', (req, res) => {
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
