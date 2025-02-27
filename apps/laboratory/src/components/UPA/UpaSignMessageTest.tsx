import * as React from 'react'

import { Button } from '@chakra-ui/react'
import Provider from '@walletconnect/universal-provider'
import base58 from 'bs58'

import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { BitcoinUtil } from '@/src/utils/BitcoinUtil'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

export function UpaSignMessageTest() {
  const toast = useChakraToast()
  const { isConnected, address } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()

  if (!caipNetwork) {
    return null
  }

  const { walletProvider } = useAppKitProvider<Provider>(caipNetwork.chainNamespace)

  async function getPayload() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map: Record<string, { method: string; params: any }> = {
      solana: {
        method: 'solana_signMessage',
        params: {
          message: base58.encode(new TextEncoder().encode('Hello Appkit!')),
          pubkey: address
        }
      },
      eip155: {
        method: 'personal_sign',
        params: [address, 'Hello AppKit!']
      },
      bip122: {
        method: 'signPsbt',
        params: {
          psbt: '',
          account: address
        }
      },
      polkadot: {
        method: 'polkadot_signMessage',
        params: {
          transactionPayload: {
            specVersion: '0x00002468',
            transactionVersion: '0x0000000e',
            address: `${address}`,
            blockHash: '0x554d682a74099d05e8b7852d19c93b527b5fae1e9e1969f6e1b82a2f09a14cc9',
            blockNumber: '0x00cb539c',
            era: '0xc501',
            genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
            method: '0x0001784920616d207369676e696e672074686973207472616e73616374696f6e21',
            nonce: '0x00000000',
            signedExtensions: [
              'CheckNonZeroSender',
              'CheckSpecVersion',
              'CheckTxVersion',
              'CheckGenesis',
              'CheckMortality',
              'CheckNonce',
              'CheckWeight',
              'ChargeTransactionPayment'
            ],
            tip: '0x00000000000000000000000000000000',
            version: 4
          },
          address
        }
      }
    }

    const payload = map[caipNetwork?.chainNamespace || '']

    if (payload && address && caipNetwork?.chainNamespace === 'bip122') {
      const utxos = await BitcoinUtil.getUTXOs(address, caipNetwork.caipNetworkId)
      const feeRate = await BitcoinUtil.getFeeRate()

      const { psbt } = BitcoinUtil.createSignPSBTParams({
        amount: 1000,
        feeRate,
        network: caipNetwork,
        recipientAddress: address,
        senderAddress: address,
        utxos
      })

      payload.params.psbt = psbt
    }

    return payload
  }

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      const payload = await getPayload()

      if (!payload) {
        throw Error('Chain not supported by laboratory')
      }

      await walletProvider.request(payload, caipNetwork?.caipNetworkId)

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: 'Success',
        type: 'success'
      })
    } catch (error) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
        type: 'error'
      })
    }
  }

  return (
    <>
      <Button
        disabled={!isConnected}
        data-testid="sign-message-button"
        onClick={onSignMessage}
        width="auto"
      >
        Sign Message
      </Button>
      <div data-testid="w3m-signature" hidden></div>
    </>
  )
}
