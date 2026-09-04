'use client'

import { useState } from 'react'

import { Button, Stack, Text } from '@chakra-ui/react'
import {
  Account,
  Asset,
  BASE_FEE,
  Networks,
  Operation,
  TransactionBuilder
} from '@stellar/stellar-base'

import type { StellarConnector } from '@reown/appkit-adapter-stellar'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

function getNetwork(caipNetworkId: string | undefined) {
  const isTestnet = caipNetworkId?.endsWith('testnet')

  return {
    passphrase: isTestnet ? Networks.TESTNET : Networks.PUBLIC,
    horizonUrl: isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org'
  }
}

export function StellarSignXDRTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'stellar' })
  const { caipNetworkId } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<StellarConnector>('stellar')
  const [signedXDR, setSignedXDR] = useState<string | undefined>()

  /*
   * Builds an unsigned envelope (a 1 XLM payment to self) so the signing methods
   * can be exercised end to end. Needs the account to exist on-chain, since the
   * sequence number comes from Horizon.
   */
  async function buildUnsignedXDR() {
    const { passphrase, horizonUrl } = getNetwork(caipNetworkId?.toString())

    const response = await fetch(`${horizonUrl}/accounts/${address}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Account ${address} is not funded on this network. Use friendbot on testnet.`
        )
      }
      throw new Error(`Failed to load Stellar account: ${response.status}`)
    }

    const data = await response.json()
    const account = new Account(address as string, data.sequence as string)

    return new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: passphrase })
      .addOperation(
        Operation.payment({
          destination: address as string,
          asset: Asset.native(),
          amount: '1'
        })
      )
      .setTimeout(120)
      .build()
      .toXDR()
  }

  async function onSignXDR() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }

      const xdr = await buildUnsignedXDR()
      const result = await walletProvider.signXDR({ xdr, address })

      setSignedXDR(result.signedXDR)
      toast({ title: 'XDR signed', description: result.signerAddress, type: 'success' })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Stellar SignXDR error:', e)
      toast({
        title: 'Sign error',
        description: e instanceof Error ? e.message : 'Failed to sign XDR',
        type: 'error'
      })
    }
  }

  async function onSignAndSubmitXDR() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }

      const xdr = await buildUnsignedXDR()
      const result = await walletProvider.signAndSubmitXDR({
        xdr,
        address,
        waitForInclusion: true
      })

      toast({ title: 'Transaction submitted', description: result.txHash, type: 'success' })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Stellar SignAndSubmitXDR error:', e)
      toast({
        title: 'Submit error',
        description: e instanceof Error ? e.message : 'Failed to submit transaction',
        type: 'error'
      })
    }
  }

  if (!isConnected || !address) {
    return <Text color="yellow">Wallet not connected</Text>
  }

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={2}>
        <Button data-testid="sign-xdr-button" onClick={onSignXDR} width="auto">
          Sign XDR
        </Button>
        <Button data-testid="sign-submit-xdr-button" onClick={onSignAndSubmitXDR} width="auto">
          Sign &amp; Submit XDR
        </Button>
      </Stack>
      {signedXDR ? (
        <Text data-testid="stellar-signed-xdr" wordBreak="break-all">
          {signedXDR}
        </Text>
      ) : null}
    </Stack>
  )
}
