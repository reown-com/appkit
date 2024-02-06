import base58 from 'bs58'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { Connector } from './BaseConnector'
import { BaseConnector } from './BaseConnector'
import type { Address } from '@web3modal/scaffold-utils/solana'
import { SolStoreUtil } from '@web3modal/scaffold-utils/solana'
import { UniversalProviderFactory } from './universalProvider'

export interface WalletConnectAppMetadata {
  name: string
  description: string
  url: string
  icons: string[]
}

export class WalletConnectConnector extends BaseConnector implements Connector {
  id = 'WalletConnect'
  name = 'WalletConnect'
  ready = true
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
      projectId: SolStoreUtil.getProjectId(),
      relayerRegion,
      metadata,
      qrcode: this.qrcode,
    })

    UniversalProviderFactory.getProvider().then(provider => {
      provider.on('session_delete', () => {
        delete provider.session?.namespaces['solana']
        SolStoreUtil.setAddress('')
      })
    })

    if (autoconnect) {
      UniversalProviderFactory.getProvider().then(provider => {
        if (provider.session?.namespaces['solana']?.accounts?.length) {
          const [defaultAccount] = provider.session.namespaces['solana'].accounts
          const address = defaultAccount?.split(':')[2] as Address
          SolStoreUtil.setIsConnected(true)
          SolStoreUtil.setAddress(address)
        }
      })
    }
  }

  public static readonly connectorName = 'walletconnect'

  public async disconnect() {
    const provider = await UniversalProviderFactory.getProvider()

    try {
      await provider.disconnect()
    } finally {
      // (TODO update typing for provider)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      delete provider.session?.namespaces['solana']
    }

    SolStoreUtil.setAddress('')
  }

  public override getConnectorName(): string {
    return WalletConnectConnector.connectorName
  }

  public override async getProvider() {
    const provider = await UniversalProviderFactory.getProvider()

    return provider
  }

  public async signMessage(message: Uint8Array) {
    const address = SolStoreUtil.state.address
    if (!address) throw new Error('No signer connected')

    const signedMessage = await this.request('solana_signMessage', {
      message: base58.encode(message),
      pubkey: address
    })
    const { signature } = signedMessage

    return signature
  }

  /*  public async signVersionedTransaction(
     params: TransactionArgs['transfer']['params']
   ) {
     const transaction = await this.constructVersionedTransaction(params)
     const transactionParams = {
       feePayer: new PublicKey(SolStoreUtil.state.address as string).toBase58(),
       instructions: transaction.message.compiledInstructions.map(instruction => ({
         ...instruction,
         data: base58.encode(instruction.data)
       })),
       recentBlockhash: transaction.message.recentBlockhash ?? ''
     }
     // @ts-ignore
     const res = await this.request('solana_signTransaction', transactionParams)
 
     return { signatures: [base58.encode(transaction.serialize())] }
   } */
  public async signVersionedTransaction(
    transaction: VersionedTransaction
  ) {
    const transactionParams = {
      feePayer: new PublicKey(SolStoreUtil.state.address as string).toBase58(),
      instructions: transaction.message.compiledInstructions.map(instruction => ({
        ...instruction,
        data: base58.encode(instruction.data)
      })),
      recentBlockhash: transaction.message.recentBlockhash ?? ''
    }
    // @ts-ignore
    const res = await this.request('solana_signTransaction', transactionParams)

    return { signatures: [{ signature: base58.encode(transaction.serialize()) }] }
  }

  /* public async signTransaction<Type extends keyof TransactionArgs>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    const transaction = await this.constructTransaction(type, params)

    const transactionParams = {
      feePayer: transaction.feePayer?.toBase58() ?? '',
      instructions: transaction.instructions.map(instruction => ({
        data: base58.encode(instruction.data),
        keys: instruction.keys.map(key => ({
          isWritable: key.isWritable,
          isSigner: key.isSigner,
          pubkey: key.pubkey.toBase58(),
        })),
        programId: instruction.programId.toBase58()
      })),
      recentBlockhash: transaction.recentBlockhash ?? ''
    }
    console.log('Formatted transaction', transactionParams)

    const res = await this.request('solana_signTransaction', transactionParams)
    transaction.addSignature(
      new PublicKey(SolStoreUtil.state.address ?? ''),
      Buffer.from(base58.decode(res.signature))
    )

    const validSig = transaction.verifySignatures()

    if (!validSig) throw new Error('Signature invalid.')

    console.log({ res, validSig })

    return base58.encode(transaction.serialize())
  } */

  public async signTransaction(
    transactionParam: Transaction | VersionedTransaction
  ) {
    const version = (transactionParam as VersionedTransaction).version
    if (typeof version === 'number') {
      return this.signVersionedTransaction(transactionParam as VersionedTransaction)
    }
    const transaction = transactionParam as Transaction
    const transactionParams = {
      feePayer: transaction.feePayer?.toBase58() ?? '',
      instructions: transaction.instructions.map(instruction => ({
        data: base58.encode(instruction.data),
        keys: instruction.keys.map(key => ({
          isWritable: key.isWritable,
          isSigner: key.isSigner,
          pubkey: key.pubkey.toBase58(),
        })),
        programId: instruction.programId.toBase58()
      })),
      recentBlockhash: transaction.recentBlockhash ?? ''
    }

    const res = await this.request('solana_signTransaction', transactionParams)
    transaction.addSignature(
      new PublicKey(SolStoreUtil.state.address ?? ''),
      Buffer.from(base58.decode(res.signature))
    )

    const validSig = transaction.verifySignatures()

    if (!validSig) throw new Error('Signature invalid.')

    return { signatures: [{ signature: base58.encode(transaction.serialize()) }] }

  }

  public async sendTransaction(transaction: Transaction | VersionedTransaction) {
    const { signatures } = await this.signTransaction(transaction)
    const encodedTransaction = transaction.serialize().toString('base64')
    await this.requestCluster('sendTransaction', [encodedTransaction])
    return signatures[0]?.signature ?? ''
  }

  // public async signAndSendTransaction<Type extends TransactionType>(
  //   type: Type,
  //   params: TransactionArgs[Type]['params']
  // ) {
  //   return this.sendTransaction(await this.signTransaction(type, params))
  // }

  /* public async signAndSendTransaction(
    transaction: Transaction
  ) {
    return this.sendTransaction((await this.signTransaction(transaction)).signatures[0]?.signature!)
  } */

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
  public async connect(useURI?: boolean) {
    const chosenCluster = SolStoreUtil.getCluster()
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
        if (this.qrcode && !useURI) { }
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
          const address = providerResult.namespaces['solana']?.accounts[0]?.split(':')[2] as Address ?? null
          if (address && this.qrcode) {
            resolve(address)
          } else reject(new Error('Could not resolve address'))
        }).catch((err: Error) => {
          console.log(`catched: `, err)
        })
    })
  }

  public async onConnector() {
    this.connect()
  }
}
