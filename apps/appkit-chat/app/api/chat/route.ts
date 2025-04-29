import { createOpenAI } from '@ai-sdk/openai'
import { experimental_createMCPClient as createMCPClient, streamText } from 'ai'

export const maxDuration = 30

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const { messages, address } = await req.json()

  const mcpClient = await createMCPClient({
    transport: {
      type: 'sse',
      url: 'http://localhost:3003/sse'
    }
  })

  console.log('>>> MCP Client created')

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You're a helpful assistant for the AppKit. AppKit is tool to connect user's wallets to decentralized applications.
    User's wallet address is ${address}.
    With the given prompt, you should return responses to the user in markdown format. Please be clear, short, and helpful. 
    If necessary, ask some data to call the tools.
    When you return some set of data, return in markdown table format.
    `,
    tools: await mcpClient.tools(),
    messages,
    onFinish: async () => {
      await mcpClient.close()
    }
  })

  return result.toDataStreamResponse()
}
