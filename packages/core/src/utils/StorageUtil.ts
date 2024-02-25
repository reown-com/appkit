/* eslint-disable no-console */
import { openDB, type DBSchema } from 'idb'
import type { WcWallet, ConnectorType } from './TypeUtil.js'

// -- Helpers -----------------------------------------------------------------
const WC_DEEPLINK = 'WALLETCONNECT_DEEPLINK_CHOICE'
const W3M_RECENT = '@w3m/recent'
const W3M_CONNECTED_WALLET_IMAGE_URL = '@w3m/connected_wallet_image_url'
const W3M_CONNECTED_CONNECTOR = '@w3m/connected_connector'
const STORE_KEY_PRIVATE_KEY = 'STORE_KEY_PRIVATE_KEY'
const STORE_KEY_PUBLIC_JWK = 'STORE_KEY_PUBLIC_JWK'
const ALGO_NAME = 'ECDSA'
const ALGO_CURVE = 'P-256'

const EC_GEN_PARAMS: EcKeyGenParams = {
  name: ALGO_NAME,
  namedCurve: ALGO_CURVE
}

interface KeysIndexedDBStore extends DBSchema {
  keypairs:
    | {
        key: typeof STORE_KEY_PRIVATE_KEY
        value: CryptoKey
      }
    | {
        key: typeof STORE_KEY_PUBLIC_JWK
        value: JsonWebKey
      }
}

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  setWalletConnectDeepLink({ href, name }: { href: string; name: string }) {
    try {
      localStorage.setItem(WC_DEEPLINK, JSON.stringify({ href, name }))
    } catch {
      console.info('Unable to set WalletConnect deep link')
    }
  },

  getWalletConnectDeepLink() {
    try {
      const deepLink = localStorage.getItem(WC_DEEPLINK)
      if (deepLink) {
        return JSON.parse(deepLink)
      }
    } catch {
      console.info('Unable to get WalletConnect deep link')
    }

    return undefined
  },

  deleteWalletConnectDeepLink() {
    try {
      localStorage.removeItem(WC_DEEPLINK)
    } catch {
      console.info('Unable to delete WalletConnect deep link')
    }
  },

  setWeb3ModalRecent(wallet: WcWallet) {
    try {
      const recentWallets = StorageUtil.getRecentWallets()
      const exists = recentWallets.find(w => w.id === wallet.id)
      if (!exists) {
        recentWallets.unshift(wallet)
        if (recentWallets.length > 2) {
          recentWallets.pop()
        }
        localStorage.setItem(W3M_RECENT, JSON.stringify(recentWallets))
      }
    } catch {
      console.info('Unable to set Web3Modal recent')
    }
  },

  getRecentWallets(): WcWallet[] {
    try {
      const recent = localStorage.getItem(W3M_RECENT)

      return recent ? JSON.parse(recent) : []
    } catch {
      console.info('Unable to get Web3Modal recent')
    }

    return []
  },

  setConnectedWalletImageUrl(imageUrl: string) {
    try {
      localStorage.setItem(W3M_CONNECTED_WALLET_IMAGE_URL, imageUrl)
    } catch {
      console.info('Unable to set Connected Wallet Image Url')
    }
  },

  getConnectedWalletImageUrl() {
    try {
      return localStorage.getItem(W3M_CONNECTED_WALLET_IMAGE_URL)
    } catch {
      console.info('Unable to set Connected Wallet Image Url')
    }

    return undefined
  },

  setConnectedConnector(connectorType: ConnectorType) {
    try {
      localStorage.setItem(W3M_CONNECTED_CONNECTOR, connectorType)
    } catch {
      console.info('Unable to set Connected Connector')
    }
  },

  getConnectedConnector() {
    try {
      return localStorage.getItem(W3M_CONNECTED_CONNECTOR) as ConnectorType
    } catch {
      console.info('Unable to get Connected Connector')
    }

    return undefined
  },

  async getIndexedDB() {
    return openDB<KeysIndexedDBStore>('web3modal-indexedDB', 1, {
      upgrade(database) {
        database.createObjectStore('keypairs')
      }
    })
  },

  async generateMagicKP() {
    const db = await this.getIndexedDB()
    console.log('db?', db)
    const { subtle } = window.crypto
    // Export the public key, while keeping private key non-extractable
    const kp = await subtle.generateKey(EC_GEN_PARAMS, false, ['sign'])

    const jwkPublicKey = await subtle.exportKey('jwk', kp.publicKey)

    await db.put('keypairs', kp.privateKey, STORE_KEY_PRIVATE_KEY)
    await db.put('keypairs', jwkPublicKey, STORE_KEY_PUBLIC_JWK)
  },

  async getOrCreateMagicPublicKey() {
    console.log('getPublicKey')
    try {
      const db = await this.getIndexedDB()
      const storedKey = await db.get('keypairs', STORE_KEY_PUBLIC_JWK)
      if (storedKey) {
        return storedKey
      }

      await this.generateMagicKP()

      return db.get('keypairs', STORE_KEY_PUBLIC_JWK) as JsonWebKey
    } catch (e) {
      console.error('getPublicKey error', e)

      return null
    }
  }
}
