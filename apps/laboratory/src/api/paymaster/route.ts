import { createClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { paymasterActionsEip7677 } from 'permissionless/experimental'

export async function POST(r: Request) {
  const req = await r.json()
  const method = req.method
  const [userOp, entrypoint] = req.params

  const paymasterService = process.env['PAYMASTER_SERVICE_URL'] || ''
  const paymasterClient = createClient({
    chain: sepolia,
    transport: http(paymasterService)
  }).extend(paymasterActionsEip7677(entrypoint))
  if (method === 'pm_getPaymasterStubData') {
    const result = await paymasterClient.getPaymasterStubData({
      userOperation: userOp
    })

    return Response.json({ result })
  } else if (method === 'pm_getPaymasterData') {
    const result = await paymasterClient.getPaymasterData({
      userOperation: userOp
    })

    return Response.json({ result })
  }

  return Response.json({ error: 'Method not found' })
}
