import { createOpenAI } from '@ai-sdk/openai'
import { experimental_createMCPClient as createMCPClient, streamText } from 'ai'

export const maxDuration = 30

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const { messages, address } = await req.json()

  const mcpClient = await createMCPClient({
    transport: {
      type: 'sse',
      url: process.env.MCP_URL!
    }
  })

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You're a helpful assistant for the AppKit. AppKit is tool to connect user's wallets to decentralized applications.
    User's wallet address is ${address}.
    With the given prompt, you should return responses to the user in markdown format. Please be clear, short, and helpful. 
    If necessary, ask some data to call the tools.
    When you return some set of data, return in markdown table format.
    `,
    tools: await mcpClient.tools(), // use MCP tools
    messages
  })

  return result.toDataStreamResponse()
}
