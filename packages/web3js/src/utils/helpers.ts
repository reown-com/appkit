import Web3 from 'web3'
import type { Provider } from '@web3modal/scaffold-utils/ethers'

export async function getBalance({ address, provider }: { address: string; provider: Provider }) {
  const web3 = new Web3(provider)

  const balance = await web3.eth.getBalance(address)

  return web3.utils.fromWei(Number(balance), 'ether')
}

export async function ensReverse({
  address,
  rpc = 'https://eth.public-rpc.com/'
}: {
  address: string
  rpc?: string
}) {
  const web3 = new Web3(rpc)
  const namehash = await web3.eth.call({
    // ENS: Reverse Registrar
    to: '0x084b1c3c81545d370f3634392de611caabff8148',
    data: web3.eth.abi.encodeFunctionCall(
      {
        name: 'node',
        type: 'function',
        inputs: [{ type: 'address', name: 'addr' }]
      },
      [address]
    )
  })

  return web3.eth.abi.decodeParameter(
    'string',
    await web3.eth.call({
      // ENS: Default Reverse Resolver
      to: '0xa2c122be93b0074270ebee7f6b7292c7deb45047',
      data: web3.eth.abi.encodeFunctionCall(
        {
          name: 'name',
          type: 'function',
          inputs: [{ type: 'bytes32', name: 'hash' }]
        },
        [namehash]
      )
    })
  ) as string | undefined
}
