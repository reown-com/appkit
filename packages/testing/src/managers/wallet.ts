import { createWalletClient, http } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

const account = privateKeyToAccount(generatePrivateKey())

export class WalletManager {
  private wallet = createWalletClient({
    account,
    chain: sepolia,
    transport: http()
  })

  getAddress() {
    return account.address
  }

  getAccounts() {
    return [account.address]
  }

  signMessage(message: string) {
    return this.wallet.signMessage({
      message
    })
  }

  signTypedData(typedData: string) {
    return this.wallet.signTypedData(JSON.parse(typedData))
  }
}
