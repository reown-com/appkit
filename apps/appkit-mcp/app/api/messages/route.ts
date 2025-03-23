import { IncomingMessage } from 'node:http'

import { getTransport } from '@/server/transportStore'

// Prevents this route's response from being cached on Vercel
export const dynamic = 'force-dynamic'

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    }
  })
}

// This endpoint handles incoming messages from the client
export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    let sessionId = url.searchParams.get('sessionId')

    if (sessionId && sessionId.includes('?sessionId=')) {
      const match = sessionId.match(/^([^?]+)/)
      if (match && match[1]) {
        sessionId = match[1]
        console.log('[Messages] Fixed session ID:', sessionId)
      }
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'sessionId is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      })
    }

    const transport = getTransport(sessionId)

    if (!transport) {
      return new Response(
        JSON.stringify({ error: 'Session not found. Please establish an SSE connection first.' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      )
    }

    const messageData = await request.json()

    return new Promise<Response>(async resolve => {
      try {
        // Create a simulated IncomingMessage for the SSEServerTransport
        // Make sure url has the sessionId in query parameters exactly as SSEServerTransport expects
        const reqUrl = new URL(request.url)
        // Clear all existing query parameters and set a clean sessionId
        reqUrl.search = ''
        reqUrl.searchParams.set('sessionId', sessionId)

        const simulatedReq = {
          method: request.method,
          url: reqUrl.toString(),
          originalUrl: reqUrl.toString(), // Some implementations use originalUrl
          headers: Object.fromEntries(request.headers.entries()),
          httpVersion: '1.1',
          httpVersionMajor: 1,
          httpVersionMinor: 1,
          rawHeaders: [],
          rawTrailers: [],
          setTimeout: () => {},
          query: { sessionId },
          body: messageData,
          on: (event: string, listener: (...args: any[]) => void) => {
            if (event === 'data') {
              listener(Buffer.from(JSON.stringify(messageData)))
            } else if (event === 'end') {
              setTimeout(() => listener(), 0)
            }
            return simulatedReq
          },
          once: () => simulatedReq,
          removeListener: () => simulatedReq,
          pipe: () => ({}),
          unpipe: () => simulatedReq
        } as unknown as IncomingMessage

        let responseStatus = 200
        let responseBody: any = { received: true }

        const simulatedRes = {
          statusCode: 200,
          status: (code: number) => {
            responseStatus = code
            simulatedRes.statusCode = code
            return {
              json: (data: any) => {
                responseBody = data
                completeResponse()
              },
              send: (data: any) => {
                responseBody = data
                completeResponse()
              }
            }
          },
          json: (data: any) => {
            responseBody = data
            completeResponse()
          },
          send: (data: any) => {
            responseBody = data
            completeResponse()
          },
          // Add required methods
          setHeader: () => simulatedRes,
          getHeader: () => '',
          removeHeader: () => {},
          end: () => completeResponse(),
          write: () => true,
          writeHead: () => simulatedRes
        }

        const completeResponse = () => {
          resolve(
            new Response(JSON.stringify(responseBody), {
              status: responseStatus,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
              }
            })
          )
        }

        // Set a timeout to ensure we don't hang forever
        const timeoutId = setTimeout(() => {
          resolve(
            new Response(JSON.stringify({ received: true, timeout: true }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
              }
            })
          )
        }, 5000)

        try {
          ;(transport as any).handlePostMessage(simulatedReq, simulatedRes)
        } catch (err) {
          console.error('[Messages] Error calling handlePostMessage:', err)
          clearTimeout(timeoutId)

          resolve(
            new Response(
              JSON.stringify({
                error: 'Error processing message',
                message: err instanceof Error ? err.message : 'Unknown error'
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
          )
        }
      } catch (err) {
        resolve(
          new Response(
            JSON.stringify({
              error: 'Error setting up request handler',
              message: err instanceof Error ? err.message : 'Unknown error'
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
        )
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    })
  }
}
