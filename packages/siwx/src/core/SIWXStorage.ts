import type { CaipNetworkId } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

/**
 * This is the interface for a SIWX storage.
 */
export interface SIWXStorage {
  /**
   * Adds a new session for the storage.
   * This method should not verify the session, only store it.
   *
   * @param session SIWXSession
   * @returns Promise<void>
   */
  add(session: SIWXSession): Promise<void>

  /**
   * Deletes a session from the storage.
   *
   * @param chainId CaipNetworkId
   * @param address string
   * @returns Promise<void>
   */
  delete(chainId: CaipNetworkId, address: string): Promise<void>

  /**
   * Gets a list of sessions for a given chainId and address.
   * This method should not verify sessions, only return the sessions that are stored.
   *
   * @param chainId CaipNetworkId
   * @param address string
   * @returns Promise<SIWXSession[]>
   */
  get(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]>

  /**
   * Replaces the current sessions with the new list of sessions.
   * This method should not verify sessions, only store them.
   *
   * @param sessions SIWXSession[]
   * @returns Promise<void>
   */
  set(sessions: SIWXSession[]): Promise<void>
}
