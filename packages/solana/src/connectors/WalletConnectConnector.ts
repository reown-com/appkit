import base58 from 'bs58'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { BaseConnector } from './BaseConnector'
import { SolStoreUtil } from '@web3modal/scaffold-utils/solana'

import { UniversalProviderFactory } from './universalProvider'

import type { Address } from '@web3modal/scaffold-utils/solana'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { Connector } from './BaseConnector'

export const solana = {
  chainId: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
  name: 'Solana',
  currency: 'SOL',
  explorerUrl: 'https://solscan.io',
  rpcUrl: 'https://rpc.walletconnect.com/v1?chainId=solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ&projectId=bbcbaddb9e8a1ae8f5f7c60f3e5a666e'
}

export const solanaTestnet = {
  chainId: '8E9rvCKLFQia2Y35HXjjpWzj8weVo44K',
  name: 'Solana Testnet',
  currency: 'SOL',
  explorerUrl: 'https://solscan.io',
  rpcUrl: 'https://api.testnet.solana.com'
}

export const solanaDevnet = {
  chainId: '8E9rvCKLFQia2Y35HXjjpWzj8weVo44K',
  name: 'Solana Devnet',
  currency: 'SOL',
  explorerUrl: 'https://solscan.io',
  rpcUrl: 'https://api.devnet.solana.com'
}

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
    if (!address) {
      throw new Error('No signer connected')
    }

    const signedMessage = await this.request('solana_signMessage', {
      message: base58.encode(message),
      pubkey: address
    })
    const { signature } = signedMessage

    return signature
  }

  public async signVersionedTransaction(
    transaction: VersionedTransaction
  ) {
    const transactionParams = {
      feePayer: new PublicKey(SolStoreUtil.state.address ?? "").toBase58(),
      instructions: transaction.message.compiledInstructions.map(instruction => ({
        ...instruction,
        data: base58.encode(instruction.data)
      })),
      recentBlockhash: transaction.message.recentBlockhash ?? ''
    }
    await this.request('solana_signTransaction', transactionParams)

    return { signatures: [{ signature: base58.encode(transaction.serialize()) }] }
  }

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

    if (!validSig) { throw new Error('Signature invalid.') }

    return { signatures: [{ signature: base58.encode(transaction.serialize()) }] }

  }

  public async sendTransaction(transactionParam: Transaction | VersionedTransaction) {
    const encodedTransaction = await this.signTransaction(transactionParam) as {
      signatures: {
        signature: string;
      }[]
    }
    const signedTransaction = base58.decode(encodedTransaction.signatures[0]?.signature ?? '')
    await SolStoreUtil.state.connection?.sendRawTransaction(signedTransaction);

    return base58.encode(signedTransaction)
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
  public generateNamespaces(chainId: string) {
    const rpcMap = {
      [`solana:${solana.chainId}`]: solana.rpcUrl,
      [`solana:${solanaTestnet.chainId}`]: solanaTestnet.rpcUrl,
      [`solana:${solanaDevnet.chainId}`]: solanaDevnet.rpcUrl
    }
    const chainsNamespaces = [
      `solana:${chainId}`
    ]
    const rpc = {
      [chainId]: rpcMap[`solana:${chainId}`] ?? '',
    }

    return {
      solana: {
        chains: [...chainsNamespaces],
        methods: ['solana_signMessage', 'solana_signTransaction'],
        events: [],
        rpcMap: rpc
      }
    }
  }

  public async connect(useURI?: boolean) {
    const solanaNamespace = this.generateNamespaces(SolStoreUtil.state.currentChain?.chainId ?? '')

    const provider = await UniversalProviderFactory.getProvider()

    return new Promise<string>((resolve, reject) => {
      provider.on('display_uri', (uri: string) => {
        if (!(this.qrcode && !useURI)) {
          resolve(uri)
        }
      })
      provider
        .connect({
          pairingTopic: undefined,
          namespaces: solanaNamespace
        })
        .then(providerResult => {
          if (!providerResult) { throw new Error('Failed connection.') }
          const address = providerResult.namespaces['solana']?.accounts[0]?.split(':')[2] as Address ?? null
          if (address && this.qrcode) {
            resolve(address)
          } else { reject(new Error('Could not resolve address')) }
        })
    })
  }

  public async onConnector() {
    await this.connect()
  }
}
