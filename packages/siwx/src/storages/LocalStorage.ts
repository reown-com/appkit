import type { SIWXSession } from '@reown/appkit-core'
import type { SIWXStorage } from '../core/SIWXStorage.js'
import type { CaipNetworkId } from '@reown/appkit-common'

export class LocalStorage implements SIWXStorage {
  private key: string

  constructor(params: LocalStorage.ConstructorParams) {
    this.key = params.key
  }

  add(session: SIWXSession): Promise<void> {
    const sessions = this.getSessions()
    sessions.push(session)
    this.setSessions(sessions)

    return Promise.resolve()
  }

  set(sessions: SIWXSession[]): Promise<void> {
    this.setSessions(sessions)

    return Promise.resolve()
  }

  get(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    const allSessions = this.getSessions()

    const validSessions = allSessions.filter(session => {
      const isSameChain = session.data.chainId === chainId
      const isSameAddress = session.data.accountAddress === address

      const startsAt = session.data.notBefore || session.data.issuedAt
      if (startsAt && Date.parse(startsAt) > Date.now()) {
        return false
      }

      const endsAt = session.data.expirationTime
      if (endsAt && Date.now() > Date.parse(endsAt)) {
        return false
      }

      return isSameChain && isSameAddress
    })

    return Promise.resolve(validSessions)
  }

  delete(chainId: string, address: string): Promise<void> {
    const sessions = this.getSessions().filter(
      session => session.data.chainId !== chainId && session.data.accountAddress !== address
    )
    this.setSessions(sessions)

    return Promise.resolve()
  }

  private getSessions(): LocalStorage.Sessions {
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage not available')
    }

    const stringItem = localStorage.getItem(this.key)

    return stringItem ? JSON.parse(stringItem) : []
  }

  private setSessions(sessions: LocalStorage.Sessions): void {
    localStorage.setItem(this.key, JSON.stringify(sessions))
  }
}

export namespace LocalStorage {
  export type ConstructorParams = {
    key: string
  }

  export type Sessions = SIWXSession[]
}
