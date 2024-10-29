import type { SIWXMessage, SIWXMessageMethods } from '@reown/appkit-core'
import { SIWXMessenger } from '../core/SIWXMessenger.js'

/**
 * Follow Informal Message template from EIP-4361
 * @see https://eips.ethereum.org/EIPS/eip-4361#informal-message-template
 *
 * @example
 * ```
 * ${scheme}:// ${domain} wants you to sign in with your Ethereum account:
 * ${address}
 *
 * ${statement}
 *
 * URI: ${uri}
 * Version: ${version}
 * Chain ID: ${chain-id}
 * Nonce: ${nonce}
 * Issued At: ${issued-at}
 * Expiration Time: ${expiration-time}
 * Not Before: ${not-before}
 * Request ID: ${request-id}
 * Resources:
 * - ${resources[0]}
 * - ${resources[1]}
 * ...
 * - ${resources[n]}
 * ```
 */
export class InformalMessenger extends SIWXMessenger {
  protected readonly version = '1'

  protected override stringify(params: Omit<SIWXMessage, keyof SIWXMessageMethods>): string {
    return [
      `${params.domain} wants you to sign in with your **blockchain** account:`,
      params.accountAddress,
      params.statement ? `\n${params.statement}\n` : '',
      `URI: ${params.uri}`,
      `Version: ${params.version}`,
      `Nonce: ${params.nonce}`,
      params.issuedAt && `Issued At: ${params.issuedAt}`,
      params.expirationTime && `Expiration Time: ${params.expirationTime}`,
      params.notBefore && `Not Before: ${params.notBefore}`,
      params.requestId && `Request ID: ${params.requestId}`,
      `Chain ID: ${params.chainId}`,
      params.resources?.length &&
        params.resources.reduce((acc, resource) => `${acc}\n- ${resource}`, 'Resources:')
    ]
      .filter(line => typeof line === 'string')
      .join('\n')
      .trim()
  }
}
