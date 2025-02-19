import type { SIWXMessage } from '@reown/appkit-controllers'

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

  private readonly clearChainIdNamespace: boolean

  constructor({ clearChainIdNamespace, ...params }: InformalMessenger.ConstructorParams) {
    super(params)
    this.clearChainIdNamespace = clearChainIdNamespace || false
  }

  protected override stringify(params: SIWXMessage.Data): string {
    const chainId = this.clearChainIdNamespace ? params.chainId.split(':')[1] : params.chainId

    return [
      `${params.domain} wants you to sign in with your **blockchain** account:`,
      params.accountAddress,
      params.statement ? `\n${params.statement}\n` : '',
      `URI: ${params.uri}`,
      `Version: ${params.version}`,
      `Chain ID: ${chainId}`,
      `Nonce: ${params.nonce}`,
      params.issuedAt && `Issued At: ${params.issuedAt}`,
      params.expirationTime && `Expiration Time: ${params.expirationTime}`,
      params.notBefore && `Not Before: ${params.notBefore}`,
      params.requestId && `Request ID: ${params.requestId}`,
      params.resources?.length &&
        params.resources.reduce((acc, resource) => `${acc}\n- ${resource}`, 'Resources:')
    ]
      .filter(line => typeof line === 'string')
      .join('\n')
      .trim()
  }
}

export namespace InformalMessenger {
  export type ConstructorParams = SIWXMessenger.ConstructorParams & {
    clearChainIdNamespace?: boolean
  }
}
