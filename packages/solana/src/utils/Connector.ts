import base58 from 'bs58'
import { PublicKey } from '@solana/web3.js'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { Connector } from './BaseConnector'
import { BaseConnector } from './BaseConnector'
import type {
  TransactionArgs,
  TransactionType,
} from '@web3modal/scaffold-utils/solana'
import { UniversalProviderFactory } from '../utils/universalProvider'
import { getAddress, getCluster, getProjectId, setAddress } from '../store'
import { Buffer } from 'buffer'

export interface WalletConnectAppMetadata {
  name: string
  description: string
  url: string
  icons: string[]
}

async function importW3mModalCtrl() {
  try {
    const web3modalCore = await import('@web3modal/core')

    web3modalCore.ConfigCtrl.setConfig({
      projectId: getProjectId()
    })

    return web3modalCore.ModalCtrl
  } catch {
    throw new Error('No @web3modal/core module found. It is needed when using the qrcode option')
  }
}

async function loadW3mModal() {
  try {
    await import('@web3modal/ui')
    document.getElementsByTagName('body')[0]?.appendChild(document.createElement('w3m-modal'))
  } catch {
    throw new Error('No @web3modal/ui module found. It is needed when using the qrcode option')
  }
}

export class WalletConnectConnector extends BaseConnector implements Connector {
  protected provider: UniversalProvider | undefined
  protected qrcode: boolean

  public constructor({
    relayerRegion,
    metadata,
    qrcode,
    autoconnect
  }: {
    relayerRegion: string
    metadata: WalletConnectAppMetadata
    qrcode?: boolean
    autoconnect?: boolean
  }) {
    super()
    this.qrcode = Boolean(qrcode)
    UniversalProviderFactory.setSettings({
      projectId: getProjectId(),
      relayerRegion,
      metadata,
      qrcode: this.qrcode
    })
    UniversalProviderFactory.getProvider().then(provider => {
      provider.on('session_delete', () => {
        delete provider.session.namespaces.solana
        setAddress('')
      })
    })
    if (typeof document !== 'undefined' && qrcode) loadW3mModal()

    if (autoconnect)
      UniversalProviderFactory.getProvider().then(provider => {
        console.log('Provider state', { provider })
        // (TODO update typing for provider)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (provider.session?.namespaces?.solana?.accounts?.length) {
          const [defaultAccount] = provider.session.namespaces.solana.accounts
          console.log('Found accounts', defaultAccount)
          const address = defaultAccount.split(':')[2]
          setAddress(address)
        }
      })
  }

  public static readonly connectorName = 'walletconnect'

  public async disconnect() {
    const provider = await UniversalProviderFactory.getProvider()

    try {
      await provider.disconnect()
    } finally {
      // (TODO update typing for provider)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      delete provider.session?.namespaces?.solana
    }

    setAddress('')
  }

  public getConnectorName(): string {
    return WalletConnectConnector.connectorName
  }

  public isAvailable() {
    return true
  }

  protected async getProvider() {
    const provider = await UniversalProviderFactory.getProvider()

    return provider
  }

  public async signMessage(message: string) {
    const address = getAddress()
    if (!address) throw new Error('No signer connected')

    const signedMessage = await this.request('solana_signMessage', {
      message: base58.encode(new TextEncoder().encode(message)),
      pubkey: address
    })
    const { signature } = signedMessage

    return signature
  }

  public async signTransaction<Type extends keyof TransactionArgs>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    const transaction = await this.constructTransaction(type, params)
    console.log('Made transaction', transaction)

    const transactionParams = {
      feePayer: transaction.feePayer?.toBase58() ?? '',
      instructions: transaction.instructions.map(instruction => ({
        data: base58.encode(instruction.data),
        keys: instruction.keys.map(key => ({
          isWritable: key.isWritable,
          isSigner: key.isSigner,
          pubkey: key.pubkey.toBase58()
        })),
        programId: instruction.programId.toBase58()
      })),
      recentBlockhash: transaction.recentBlockhash ?? ''
    }

    console.log('Formatted transaction', transactionParams)

    const res = await this.request('solana_signTransaction', transactionParams)
    transaction.addSignature(
      new PublicKey(getAddress() ?? ''),
      Buffer.from(base58.decode(res.signature))
    )

    const validSig = transaction.verifySignatures()

    if (!validSig) throw new Error('Signature invalid.')

    console.log({ res, validSig })

    return base58.encode(transaction.serialize())
  }

  public async signAndSendTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    return this.sendTransaction(await this.signTransaction(type, params))
  }

  /**
   * Connect to user's wallet.
   *
   * If `WalletConnectConnector` was configured with `qrcode = true`, this will
   * open a QRCodeModal, where the user will scan the qrcode and then this
   * function will resolve/return the address of the wallet.
   *
   * If `qrcode = false`, this will return the pairing URI used to generate the
   * QRCode.
   */
  public async connect() {
    const chosenCluster = getCluster()
    const clusterId = `solana:${chosenCluster.id}`

    const solanaNamespace = {
      solana: {
        chains: [clusterId],
        methods: ['solana_signMessage', 'solana_signTransaction'],
        events: [],
        rpcMap: {
          [clusterId]: chosenCluster.endpoint
        }
      }
    }

    const provider = await UniversalProviderFactory.getProvider()

    return new Promise<string>((resolve, reject) => {
      provider.on('display_uri', (uri: string) => {
        if (this.qrcode)
          importW3mModalCtrl().then(ModalCtrl => {
            ModalCtrl.open({ uri, standaloneChains: [clusterId] })
          })
        else resolve(uri)
      })

      provider
        .connect({
          pairingTopic: undefined,
          namespaces: solanaNamespace
        })
        .then(providerResult => {
          if (!providerResult) throw new Error('Failed connection.')
          // (TODO update typing for provider)
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          const address = providerResult.namespaces?.solana?.accounts[0]?.split(':')[2]

          if (address && this.qrcode) {
            setAddress(address)
            resolve(address)
            importW3mModalCtrl().then(ModalCtrl => {
              ModalCtrl.close()
            })
          } else reject(new Error('Could not resolve address'))
        })
    })
  }
}
