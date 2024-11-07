import type { SIWXMessage } from '@reown/appkit-core'

export abstract class SIWXMessenger {
  public domain: SIWXMessage['domain']
  public uri: SIWXMessage['uri']
  public statement?: SIWXMessage['statement']
  public resources?: SIWXMessage['resources']

  protected abstract readonly version: SIWXMessage['version']

  protected expiration?: number
  protected getNonce: SIWXMessenger.ConstructorParams['getNonce']
  protected getRequestId?: SIWXMessenger.ConstructorParams['getRequestId']

  protected abstract stringify(params: SIWXMessage.Data): string

  constructor(params: SIWXMessenger.ConstructorParams) {
    this.expiration = params.expiration
    this.getNonce = params.getNonce
    this.getRequestId = params.getRequestId
    this.domain = params.domain
    this.uri = params.uri
    this.statement = params.statement
    this.resources = params.resources
  }

  async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    const params = {
      accountAddress: input.accountAddress,
      chainId: input.chainId,
      version: this.version,
      domain: this.domain,
      uri: this.uri,
      statement: this.statement,
      resources: this.resources,
      nonce: await this.getNonce(input),
      requestId: await this.getRequestId?.(),
      expirationTime: this.getExpirationTime(input),
      issuedAt: this.getIssuedAt(),
      notBefore: this.getNotBefore(input)
    }

    const methods = {
      toString: () => this.stringify(params)
    } satisfies SIWXMessage.Methods

    return Object.assign(params, methods)
  }

  protected getExpirationTime({
    notBefore
  }: Pick<SIWXMessage.Input, 'notBefore'>): string | undefined {
    if (typeof this.expiration === 'undefined') {
      return undefined
    }

    const startingAt = notBefore ? new Date(notBefore).getTime() : Date.now()

    return this.stringifyDate(new Date(startingAt + this.expiration))
  }

  protected getNotBefore({ notBefore }: Pick<SIWXMessage.Input, 'notBefore'>): string | undefined {
    return notBefore ? this.stringifyDate(new Date(notBefore)) : undefined
  }

  protected getIssuedAt(): string {
    return this.stringifyDate(new Date())
  }

  protected stringifyDate(date: Date): string {
    return date.toISOString()
  }
}

export namespace SIWXMessenger {
  export interface ConstructorParams extends Omit<SIWXMessage.Metadata, 'nonce' | 'version'> {
    /**
     * Time in milliseconds
     */
    expiration?: number
    /**
     * Getter function for message nonce value
     */
    getNonce: (params: SIWXMessage.Input) => Promise<SIWXMessage['nonce']>
    /**
     * Getter function for message request ID
     * If not provided, the request ID will be omitted
     */
    getRequestId?: () => Promise<SIWXMessage['requestId']>
  }
}
