import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

// A global store for SSE transports
const transportMap = new Map<string, SSEServerTransport>()

export function storeTransport(sessionId: string, transport: SSEServerTransport) {
  transportMap.set(sessionId, transport)
}

export function getTransport(sessionId: string) {
  return transportMap.get(sessionId)
}

export function removeTransport(sessionId: string) {
  transportMap.delete(sessionId)
}
