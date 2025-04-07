import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { EventEmitter } from 'node:events'
import { ServerResponse } from 'node:http'

import { server } from '@/server'
import { removeTransport, storeTransport } from '@/server/transportStore'

// Prevents this route's response from being cached on Vercel
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes maximum duration

export async function GET(request: Request) {
  const encoder = new TextEncoder()
  const sessionId = crypto.randomUUID()

  console.log('[SSE] Starting SSE connection handler')

  try {
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    const messagesUrl = `${origin}/api/messages`

    // Create a streaming response for SSE
    const customReadable = new ReadableStream({
      start(controller) {
        try {
          // Send an initial message to verify the connection works
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'initializing' })}\n\n`)
          )

          // Create a custom EventEmitter for handling events
          const eventEmitter = new EventEmitter()

          // Create a more complete ServerResponse simulation with event handling
          const responseObject = {
            write: (data: string) => {
              try {
                controller.enqueue(encoder.encode(data))
                return true
              } catch (err) {
                console.error('[SSE] Error enqueueing data:', err)
                return false
              }
            },
            // Add required methods from ServerResponse
            setHeader: () => {},
            end: () => {
              controller.close()
            },
            // Add event handling (critical for SSEServerTransport)
            on: (event: string, listener: (...args: any[]) => void) => {
              eventEmitter.on(event, listener)
              return responseObject
            },
            once: (event: string, listener: (...args: any[]) => void) => {
              eventEmitter.once(event, listener)
              return responseObject
            },
            removeListener: (event: string, listener: (...args: any[]) => void) => {
              eventEmitter.removeListener(event, listener)
              return responseObject
            },
            statusCode: 200,
            headersSent: false,
            writableEnded: false,
            writableFinished: false,
            sendDate: true,
            finished: false,
            writeHead: () => responseObject,
            getHeader: () => '',
            getHeaders: () => ({}),
            getHeaderNames: () => [],
            hasHeader: () => false,
            removeHeader: () => {},
            addTrailers: () => {}
          }

          const messagesUri = new URL(messagesUrl)
          messagesUri.searchParams.set('sessionId', sessionId)
          const messagesUrlWithSession = messagesUri.toString()

          let transport: SSEServerTransport
          try {
            transport = new SSEServerTransport(
              messagesUrlWithSession,
              responseObject as unknown as ServerResponse
            )

            storeTransport(sessionId, transport)

            server
              .connect(transport)
              .then(() => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`)
                )

                setTimeout(
                  () => {
                    eventEmitter.emit('close')
                  },
                  1000 * 60 * 60
                )
              })
              .catch(error => {
                console.error('[SSE] Error connecting to MCP server:', error)
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`
                  )
                )
              })
          } catch (err) {
            console.error('[SSE] Error creating or connecting transport:', err)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', error: 'Failed to initialize MCP server connection' })}\n\n`
              )
            )
            throw err
          }

          const interval = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`))
            } catch (err) {
              console.error('[SSE] Error sending ping:', err)
            }
          }, 30000) // Send ping every 30 seconds

          return () => {
            clearInterval(interval)
            removeTransport(sessionId)
            eventEmitter.removeAllListeners()
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`)
            )
            controller.close()
          } catch (err) {
            console.error('[SSE] Error during error handling:', err)
          }
        }
      }
    })

    return new Response(customReadable, {
      headers: {
        Connection: 'keep-alive',
        'Content-Encoding': 'none',
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream; charset=utf-8',
        // Add CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      }
    )
  }
}
