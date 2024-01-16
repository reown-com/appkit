import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import base58 from 'bs58'
import borsh from 'borsh'
import { Buffer } from 'buffer'
import { SolConstantsUtil, SolStoreUtil } from '@web3modal/scaffold-utils/solana'

import { registerListener, unregisterListener } from '../utils/clusterFactory'
import { getHashedName, getNameAccountKey } from '../utils/hash'
import { FavouriteDomain, NameRegistry } from '../utils/nameService'

import type {
  BlockResult,
  AccountInfo,
  ClusterRequestMethods,
  ClusterSubscribeRequestMethods,
  FilterObject,
  RequestMethods,
  TransactionArgs,
  TransactionType
} from '@web3modal/scaffold-utils/solana'

export interface Connector {
  id: string
  name: string
  ready: boolean
  getConnectorName: () => string
  disconnect: () => Promise<void>
  connect: () => Promise<string>
  signMessage: (message: string) => Promise<string>
  signTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) => Promise<string>
  sendTransaction: (encodedTransaction: string) => Promise<string>
  getAccount: (
    requestedAddress?: string,
    encoding?: 'base58' | 'base64' | 'jsonParsed'
  ) => Promise<AccountInfo | null>
  signAndSendTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) => Promise<string>
  getBalance: (requestedAddress?: string) => Promise<{
    formatted: string
    value: BN
    decimals: number
    symbol: string
  } | null>
  getTransaction: (
    transactionSignature: string
  ) => Promise<ClusterRequestMethods['getTransaction']['returns']>
  watchTransaction: (
    transactionSignature: string,
    callback: (params: unknown) => void
  ) => Promise<() => void>
  getSolDomainsFromPublicKey: (address: string) => Promise<string[]>
  getAddressFromDomain: (address: string) => Promise<string | null>
  getFavoriteDomain: (address: string) => Promise<{ domain: PublicKey; reverse: string } | null>
  getBlock: (slot: number) => Promise<BlockResult | null>
  getFeeForMessage: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) => Promise<number>
}

export class BaseConnector {
  public getConnectorName() {
    return 'base'
  }
  protected async getProvider(): Promise<{
    /* eslint-disable @typescript-eslint/no-explicit-any */
    request: (args: any) => any
  }> {
    return Promise.reject(new Error('No provider in base connector'))
  }

  protected async constructTransaction<TransType extends keyof TransactionArgs>(
    type: TransType,
    params: TransactionArgs[TransType]['params']
  ) {
    const transaction = new Transaction()

    const fromAddress = SolStoreUtil.state.address

    if (!fromAddress) throw new Error('No address connected')
    const fromPubkey = new PublicKey(fromAddress)

    if (type === 'transfer') {
      const transferParams = params as TransactionArgs['transfer']['params']
      const toPubkey = new PublicKey(transferParams.to)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: new PublicKey(transferParams.to),
          lamports: transferParams.amountInLamports
        })
      )
      transaction.feePayer = transferParams.feePayer === 'from' ? fromPubkey : toPubkey
    } else if (type === 'program') {
      const programParams = params as TransactionArgs['program']['params']
      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: fromPubkey, isSigner: true, isWritable: programParams.isWritableSender }
          ],
          programId: new PublicKey(programParams.programId),
          data: Buffer.from(base58.decode(JSON.stringify(programParams.data)))
        })
      )
      transaction.feePayer = fromPubkey
    } else throw new Error(`No transaction configuration for type ${String(type)}`)

    const response = await this.requestCluster('getLatestBlockhash', [{}])

    const { blockhash: recentBlockhash } = response.value
    transaction.recentBlockhash = recentBlockhash

    return transaction
  }

  public async sendTransaction(encodedTransaction: string) {
    const signature = await this.requestCluster('sendTransaction', [encodedTransaction])

    return signature
  }

  public async getTransaction(transactionSignature: string) {
    const transaction = await this.requestCluster('getTransaction', [
      transactionSignature,
      { encoding: 'jsonParsed', commitment: 'confirmed' }
    ])

    return transaction
  }

  public async watchTransaction(
    transactionSignature: string,
    callback: (params: Transaction | number) => void
  ) {
    return this.subscribeToCluster('signatureSubscribe', [transactionSignature], callback)
  }

  public async getBalance(requestedAddress?: string, currency: 'lamports' | 'sol' = 'sol') {
    const address = requestedAddress ?? SolStoreUtil.state.address
    if (!address) return null

    const balance = await this.requestCluster('getBalance', [address, { commitment: 'processed' }])
    /* @todo fix balance issue*/
    console.log("balance is ", balance);

    const formatted = currency === 'lamports' ? `${balance?.value || 0} lamports` : `${balance?.value || 0} sol`

    return {
      value: new BN(balance?.value || 0),
      formatted,
      decimals: balance?.value || 0,
      symbol: currency
    }
  }

  public async getFeeForMessage<TransType extends keyof TransactionArgs>(
    type: TransType,
    params: TransactionArgs[TransType]['params']
  ) {
    const transaction = await this.constructTransaction(type, params)
    const message = transaction.compileMessage().serialize()
    const encodedMessage = message.toString('base64')

    const result = await this.requestCluster('getFeeForMessage', [encodedMessage])

    return result
  }

  public async getProgramAccounts(requestedAddress: string, filters?: FilterObject[]) {
    const programAccounts = await this.requestCluster('getProgramAccounts', [
      requestedAddress,
      { filters: filters ?? [], encoding: 'jsonParsed', withContext: true }
    ])

    return programAccounts.value
  }

  public async getAllDomains(address: string) {
    const accounts = await this.getProgramAccounts(SolConstantsUtil.NAME_PROGRAM_ID.toBase58(), [
      {
        memcmp: {
          offset: 32,
          bytes: address
        }
      },
      {
        memcmp: {
          offset: 0,
          bytes: SolConstantsUtil.ROOT_DOMAIN_ACCOUNT.toBase58()
        }
      }
    ])

    return accounts.map(({ pubkey }: any) => pubkey)
  }

  public async getAccount(
    nameAccountKey?: string,
    encoding: 'base58' | 'base64' | 'jsonParsed' = 'base58'
  ) {
    const address = nameAccountKey ?? SolStoreUtil.state.address

    if (!address) throw new Error('No address supplied and none connected')

    const response = await this.requestCluster('getAccountInfo', [
      address,
      {
        encoding
      }
    ])

    if (!response) throw new Error('Invalid name account provided')

    const { value: nameAccount } = response

    return nameAccount
  }

  public async performReverseLookup(address: string) {
    const hashedReverseLookup = getHashedName(address)
    const reverseLookupAccount = await getNameAccountKey(
      hashedReverseLookup,
      SolConstantsUtil.REVERSE_LOOKUP_CLASS
    )

    const account = await this.getAccount(reverseLookupAccount.toBase58(), 'base64')

    if (account) {
      const dataBuffer = Buffer.from(String(account.data[0]), 'base64')
      const deserialized = borsh.deserializeUnchecked(
        NameRegistry.schema,
        NameRegistry,
        dataBuffer
      ) as { data: any }

      deserialized.data = dataBuffer.slice(96)

      const nameLength = new BN(deserialized.data.slice(0, 4), 'le').toNumber()
      const name = `${deserialized.data.slice(4, 4 + nameLength).toString()}.sol`

      return name
    }

    throw new Error(`Failed to perform reverse lookup on ${address}`)
  }

  public async getSolDomainsFromPublicKey(address: string): Promise<string[]> {
    const allDomainKeys = await this.getAllDomains(address)
    const allDomainNames = await Promise.all(
      allDomainKeys.map(async (key: string) => {
        return this.performReverseLookup(key)
      })
    )

    return allDomainNames
  }

  public async getBlock(slot: number) {
    const block = await this.requestCluster('getBlock', [slot])

    return block
  }

  public async getAddressFromDomain(domain: string) {
    const hashed = getHashedName(domain.replace('.sol', ''))

    const nameAccountKey = await getNameAccountKey(
      hashed,
      undefined,
      SolConstantsUtil.ROOT_DOMAIN_ACCOUNT
    )
    const ownerDataRaw = await this.getAccount(nameAccountKey.toBase58(), 'base64')

    if (!ownerDataRaw) return null

    const ownerData = borsh.deserializeUnchecked(
      NameRegistry.schema,
      NameRegistry,
      Buffer.from(String(ownerDataRaw.data[0]), 'base64')
    ) as { owner: any }

    return ownerData.owner.toBase58()
  }

  public async getFavoriteDomain(address: string) {
    const domainBuffer = Buffer.from('favourite_domain')
    const pubkeyBuffer = new PublicKey(address).toBuffer()
    const [favKey] = await PublicKey.findProgramAddress(
      [domainBuffer, pubkeyBuffer],
      SolConstantsUtil.NAME_OFFERS_ID
    )

    const favoriteDomainAccInfo = await this.getAccount(favKey.toBase58(), 'base64')

    if (!favoriteDomainAccInfo) return null

    const favoriteDomainData = borsh.deserialize(
      FavouriteDomain.schema,
      FavouriteDomain,
      Buffer.from(String(favoriteDomainAccInfo.data[0]), 'base64')
    ) as any

    const reverse = await this.performReverseLookup(favoriteDomainData.nameAccount.toBase58())

    const result = { domain: favoriteDomainData.nameAccount, reverse }

    return result
  }

  public async request<Method extends keyof RequestMethods>(
    method: Method,
    params: RequestMethods[Method]['params']
  ): Promise<RequestMethods[Method]['returns']> {
    return (await this.getProvider()).request({ method, params })
  }

  public async subscribeToCluster<Method extends keyof ClusterSubscribeRequestMethods>(
    method: Method,
    params: ClusterSubscribeRequestMethods[Method]['params'],
    callback: (params: Transaction | number) => void
  ) {
    const id = await registerListener(method, params, callback)

    return () => {
      unregisterListener(id)
    }
  }

  public async requestCluster<Method extends keyof ClusterRequestMethods>(
    method: Method,
    params: ClusterRequestMethods[Method]['params']
  ): Promise<ClusterRequestMethods[Method]['returns']> {
    const cluster = SolStoreUtil.getCluster()
    console.log(`cluster in request cluster`, cluster);
    const { endpoint } = cluster
    const res: { result: ClusterRequestMethods[Method]['returns'] } = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({
        method,
        params,
        jsonrpc: '2.0',
        id: SolStoreUtil.getNewRequestId()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async httpRes => {
        const json = await httpRes.json()

        console.log({ json })

        return json
      })
      .catch(err => {
        console.error(`Failed to fetch ${endpoint}`, err)
      })

    return res.result
  }
}
