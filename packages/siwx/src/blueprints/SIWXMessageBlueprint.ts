import type {
  SIWXMessage,
  SIWXMessageInput,
  SIWXMessageMetadata,
  SIWXMessageMethods
} from '@reown/appkit-core'

export abstract class SIWXMessageBlueprint {
  public domain: SIWXMessage['domain']
  public uri: SIWXMessage['uri']
  public statement?: SIWXMessage['statement']
  public resources?: SIWXMessage['resources']

  protected abstract readonly version: SIWXMessage['version']

  protected expiration?: number
  protected getNonce: SIWXMessageBlueprint.BlueprintParams['getNonce']
  protected getRequestId?: SIWXMessageBlueprint.BlueprintParams['getRequestId']

  protected abstract stringify(params: Omit<SIWXMessage, keyof SIWXMessageMethods>): string

  constructor(params: SIWXMessageBlueprint.BlueprintParams) {
    this.expiration = params.expiration
    this.getNonce = params.getNonce
    this.getRequestId = params.getRequestId
    this.domain = params.domain
    this.uri = params.uri
    this.statement = params.statement
    this.resources = params.resources
  }

  async createMessage(input: SIWXMessageInput): Promise<SIWXMessage> {
    const params = {
      accountAddress: input.accountAddress,
      chainId: input.chainId,
      version: this.version,
      domain: this.domain,
      uri: this.uri,
      statement: this.statement,
      resources: this.resources,
      nonce: await this.getNonce(),
      requestId: await this.getRequestId?.(),
      expirationTime: this.getExpirationTime(input),
      issuedAt: this.getIssuedAt(),
      notBefore: this.getNotBefore(input)
    }

    const methods = {
      toString: () => this.stringify(params)
    } satisfies SIWXMessageMethods

    return Object.assign(params, methods)
  }

  protected getExpirationTime({
    notBefore
  }: Pick<SIWXMessageInput, 'notBefore'>): string | undefined {
    if (typeof this.expiration === 'undefined') {
      return undefined
    }

    const startingAt = notBefore ? new Date(notBefore).getTime() : Date.now()

    return this.stringifyDate(new Date(startingAt + this.expiration))
  }

  protected getNotBefore({ notBefore }: Pick<SIWXMessageInput, 'notBefore'>): string | undefined {
    return notBefore ? this.stringifyDate(new Date(notBefore)) : undefined
  }

  protected getIssuedAt(): string {
    return this.stringifyDate(new Date())
  }

  protected stringifyDate(date: Date): string {
    return date.toISOString()
  }
}

export namespace SIWXMessageBlueprint {
  export interface BlueprintParams extends Omit<SIWXMessageMetadata, 'nonce' | 'version'> {
    /**
     * Time in milliseconds
     */
    expiration?: number
    /**
     * Getter function for message nonce value
     */
    getNonce: () => Promise<SIWXMessage['nonce']>
    /**
     * Getter function for message request ID
     * If not provided, the request ID will be omitted
     */
    getRequestId?: () => Promise<SIWXMessage['requestId']>
  }
}
