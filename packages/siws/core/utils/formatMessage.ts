import { Header, Payload, SIWS } from '@web3auth/sign-in-with-solana'
import type { SIWSCreateMessageArgs } from './TypeUtils'

export function createSolanaMessage(args: SIWSCreateMessageArgs): SIWS {
  const header = new Header()
  header.t = 'sip99'

  const payload = new Payload()
  payload.domain = args.domain
  payload.address = args.address
  payload.uri = args.uri
  payload.statement = args.statement
  payload.version = args.version
  payload.chainId = 1 // args.chainId
  payload.requestId = args.requestId
  payload.resources = args.resources
  payload.issuedAt = args.iat ?? ''
  //   payload.expiry = args.expiry
  payload.notBefore = args.nbf
  payload.expirationTime = args.exp

  const message = new SIWS({
    header,
    payload
  })

  return message
}
