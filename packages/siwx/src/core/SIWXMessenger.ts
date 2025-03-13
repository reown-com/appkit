import type { SIWXMessage } from '@reown/appkit-controllers'

/**
 * This is the base class for a SIWX messenger.
 * It provides the basic structure for creating a SIWX message and util functions.
 */
export abstract class SIWXMessenger {
  public domain: SIWXMessage['domain']
  public uri: SIWXMessage['uri']
  public statement?: SIWXMessage['statement']
  public resources?: SIWXMessage['resources']

  /**
   * The version of the SIWXMessage class
   */
  protected abstract readonly version: SIWXMessage['version']

  /**
   * Expiration time in milliseconds
   */
  protected expiration?: number

  /**
   * Getter function for message nonce value
   */
  protected getNonce: SIWXMessenger.ConstructorParams['getNonce']

  /**
   * Getter function for message request ID
   */
  protected getRequestId?: SIWXMessenger.ConstructorParams['getRequestId']

  /**
   * The method that generates the message string.
   * This method must be implemented by the child class.
   *
   * @param params SIWXMessage.Data
   * @returns string
   */
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

  /**
   * This is the default method to create a SIWXMessage object.
   * It will call the `getNonce`, `getRequestId`, `getExpirationTime`, `getIssuedAt`, and `getNotBefore` methods.
   * It appends the `stringify` method to the object as `toString`.
   *
   * @param input SIWXMessage.Input
   * @returns
   */
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

  /**
   * This method generates the expiration time based on the `notBefore` value and the `expiration` value.
   * You may override this method to provide a custom expiration time.
   *
   * @param Pick<SIWXMessage.Input, 'notBefore'>
   * @returns string | undefined - The expiration time in `stringifyDate` format or undefined if not available
   */
  protected getExpirationTime({
    notBefore
  }: Pick<SIWXMessage.Input, 'notBefore'>): string | undefined {
    if (typeof this.expiration === 'undefined') {
      return undefined
    }

    const startingAt = notBefore ? new Date(notBefore).getTime() : Date.now()

    return this.stringifyDate(new Date(startingAt + this.expiration))
  }

  /**
   * This method generates the `notBefore` formatted value based on the `notBefore` input.
   * You may override this method to provide a custom `notBefore` value.
   *
   * @param Pick<SIWXMessage.Input, 'notBefore'>
   * @returns string | undefined - The `notBefore` value in `stringifyDate` format or undefined if not available
   */
  protected getNotBefore({ notBefore }: Pick<SIWXMessage.Input, 'notBefore'>): string | undefined {
    return notBefore ? this.stringifyDate(new Date(notBefore)) : undefined
  }

  /**
   * This method generates the `issuedAt` formatted value based on the current date.
   * You may override this method to provide a custom `issuedAt` value.
   *
   * @returns string - The `issuedAt` value in `stringifyDate` format
   */
  protected getIssuedAt(): string {
    return this.stringifyDate(new Date())
  }

  /**
   * This method converts a date object to a formatted string.
   * You may override this method to provide a custom date format.
   *
   * @param date Date
   * @returns string - The date in ISO format
   */
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
