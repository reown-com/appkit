import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface AccountControllerState {
  address: string
  balance: string
  profileName?: string
  profileImage?: string
}

export interface AccountControllerClientProxy {
  getAddress: () => Promise<AccountControllerState['address']>
  getBalance: () => Promise<AccountControllerState['balance']>
  getProfileName?: () => Promise<AccountControllerState['profileName']>
  getProfileImage?: () => Promise<AccountControllerState['profileImage']>
}

// -- Controller ---------------------------------------------------------------
export class AccountController {
  public state = proxy<AccountControllerState>({
    address: '',
    balance: ''
  })

  #clientProxy: AccountControllerClientProxy

  public constructor(clientProxy: AccountControllerClientProxy) {
    this.#clientProxy = clientProxy
  }

  public async getAddress() {
    this.state.address = await this.#clientProxy.getAddress()
  }

  public async getBalance() {
    this.state.balance = await this.#clientProxy.getBalance()
  }

  public async getProfileName() {
    if (this.#clientProxy.getProfileName) {
      this.state.profileName = await this.#clientProxy.getProfileName()
    }
  }

  public async getProfileImage() {
    if (this.#clientProxy.getProfileImage) {
      this.state.profileImage = await this.#clientProxy.getProfileImage()
    }
  }
}
