import { vi } from 'vitest'

import { ErrorUtil } from '@reown/appkit-utils'
import { type W3mFrameTypes } from '@reown/appkit-wallet'
import { W3mFrameProviderSingleton } from '@reown/appkit/auth-provider'

import type { AuthProvider } from '../../providers/AuthProvider.js'
import { TestConstants } from '../util/TestConstants.js'

export function mockW3mFrameProvider() {
  const w3mFrame = W3mFrameProviderSingleton.getInstance({
    projectId: 'projectId',
    chainId: 1,
    abortController: ErrorUtil.EmbeddedWalletAbortController,
    getActiveCaipNetwork: () => TestConstants.chains[0]
  })

  w3mFrame.connect = vi.fn(() => Promise.resolve(mockSession()))
  w3mFrame.disconnect = vi.fn(() => Promise.resolve(undefined))
  w3mFrame.request = vi.fn((request: W3mFrameTypes.RPCRequest) => {
    switch (request.method) {
      case 'solana_signMessage':
        return Promise.resolve({
          signature:
            '5bW5EoLn696QKxgJbsDb1aXrBf9hSUvvCa9FbyRt6CyppX4cQMJWyKx736ka5WDKqCZaoVivpWaxHhcAbSwhNx6Qp5Df3cHvSkg7jSX8PVw7FMKv45B5ZaeLjYHubDVsQEFFAs3Ea1CZU7X8xCv2JbhQvoxMoFWAKxUyFbM3DFH4KzuLL5nMZ9ybkiYfGdAAzwfMTDFLY7ymdzG12mWpvPwLJnwECDgHG7BogzZBdehndK8KP5sPLY5VcgVp5D87crr7XhUwmw5QLtDjPMnp4YKwApSS58jVNw3Zy'
        })
      case 'solana_signTransaction':
        return Promise.resolve({
          transaction:
            '4zZMC2ddAFY1YHcA2uFCqbuTHmD1xvB5QLzgNnT3dMb4aQT98md8jVm1YRGUsKJkYkLPYarnkobvESUpjqEUnDmoG76e9cgNJzLuFXBW1i6njs2Sy1Lnr9TZmLnhif5CYjh1agVJEvjfYpTq1QbTnLS3rBt4yKVjQ6FcV3x22Vm3XBPqodTXz17o1YcHMcvYQbHZfVUyikQ3Nmv6ktZzWe36D6ceKCVBV88VvYkkFhwWUWkA5ErPvsHWQU64VvbtENaJXFUUnuqTFSX4q3ccHuHdmtnhWQ7Mv8Xkb'
        })
      case 'solana_signAndSendTransaction':
        return Promise.resolve({
          signature:
            '2Lb1KQHWfbV3pWMqXZveFWqneSyhH95YsgCENRWnArSkLydjN1M42oB82zSd6BBdGkM9pE6sQLQf1gyBh8KWM2c4'
        })
      case 'solana_signAllTransactions':
        return Promise.resolve({
          transactions: Array.from({ length: request.params.transactions.length }).map(
            () =>
              '4zZMC2ddAFY1YHcA2uFCqbuTHmD1xvB5QLzgNnT3dMb4aQT98md8jVm1YRGUsKJkYkLPYarnkobvESUpjqEUnDmoG76e9cgNJzLuFXBW1i6njs2Sy1Lnr9TZmLnhif5CYjh1agVJEvjfYpTq1QbTnLS3rBt4yKVjQ6FcV3x22Vm3XBPqodTXz17o1YcHMcvYQbHZfVUyikQ3Nmv6ktZzWe36D6ceKCVBV88VvYkkFhwWUWkA5ErPvsHWQU64VvbtENaJXFUUnuqTFSX4q3ccHuHdmtnhWQ7Mv8Xkb'
          )
        })

      default:
        return Promise.reject(new Error('not implemented'))
    }
  })
  w3mFrame.switchNetwork = vi.fn((args: { chainId: string | number }) =>
    Promise.resolve({ chainId: args.chainId })
  )
  w3mFrame.getUser = vi.fn(() => Promise.resolve(mockSession()))
  w3mFrame.user = mockSession()

  return w3mFrame
}

export function mockSession(): AuthProvider.Session {
  return {
    address: TestConstants.accounts[0].address,
    chainId: TestConstants.chains[0]?.id || ''
  }
}
