import { Connector } from '@wagmi/core'
import { IS_SERVER, W3aUtil, type Eip1193Provider } from '@web3modal/core'
import { createWalletClient, custom } from 'viem'

export const WEB3ACCOUNT_CONNECTOR_ID = 'walletConnect-web3account'

/*
 * Based off of:
 * - https://github.com/EveripediaNetwork/wagmi-magic-connector/blob/main/src/lib/connectors/magicConnector.ts
 * - https://github.com/EveripediaNetwork/wagmi-magic-connector/blob/main/src/lib/connectors/magicAuthConnector.ts
 */

export class Web3AccountConnector extends Connector<Eip1193Provider, unknown> {
  /*
   * Prefixing with 'walletConnect' so it is filtered out of the UI in Web3Modal:
   * https://github.com/WalletConnect/web3modal/blob/09ff0b85e90ffd4219c680d5a7cde7961cd978be/chains/ethereum/src/client.ts#L85
   */
  public id = WEB3ACCOUNT_CONNECTOR_ID
  // This is displayed in some error messages, so naming it something non-internal
  public name = 'Email'
  public ready = !IS_SERVER

  public constructor() {
    super({ options: {} })
  }

  public async isAuthorized(): Promise<boolean> {
    return W3aUtil.isAuthorized()
  }

  public async disconnect(): Promise<void> {
    return W3aUtil.disconnect()
  }

  public async connect(_config?: { chainId?: number | undefined } | undefined) {
    if (await this.isAuthorized()) {
      // Handle auto connect
      return {
        provider: this.getProvider(),
        chain: {
          // Await this.getChainId(),
          id: 0,
          unsupported: false
        },
        account: await this.getAccount()
      }
    }
    throw new Error(
      'Not already logged in, must call sendEmailVerification() and verifyEmail() instead to login'
    )
  }

  // public async getAccount(): Promise<Address> {
  //   return W3aUtil.getAccount()
  // }

  public async getChainId(): Promise<number> {
    /*
     * Const networkOptions = this.magicSdkConfiguration?.network
     * if (typeof networkOptions === 'object') {
     *   const chainID = networkOptions.chainId
     *   if (chainID) {
     *     return normalizeChainId(chainID)
     *   }
     * }
     */
    throw new Error('Chain ID is not defined')
  }

  // public async getProvider(): Promise<Eip1193Provider> {
  //   return W3aUtil.getProvider()
  // }

  public async getWalletClient({ chainId }: { chainId?: number } = {}): ReturnType<
    Connector['getWalletClient']
  > {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()])
    const chain = this.chains.find(x => x.id === chainId)
    if (!provider) {
      throw new Error('provider is required.')
    }

    return createWalletClient({
      account,
      chain,
      transport: custom(provider)
    })
  }

  protected onAccountsChanged(_accounts: string[]): void {
    throw new Error('unsupported onAccountsChanged')
    /*
     * If (accounts.length === 0) this.emit('disconnect')
     * else this.emit('change', { account: getAddress(accounts[0]) })
     */
  }

  protected onChainChanged(_chainId: number | string): void {
    throw new Error('unsupported onChainChanged')
    /*
     * Const id = normalizeChainId(chainId)
     * const unsupported = this.isChainUnsupported(id)
     * this.emit('change', { chain: { id, unsupported } })
     */
  }

  protected onDisconnect(): void {
    throw new Error('unsupported onDisconnect')
    /*
     * Console.warn('DISCONNECT')
     * this.emit('disconnect')
     */
  }
}
