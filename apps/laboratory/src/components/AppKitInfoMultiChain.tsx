import * as React from 'react'

import { Grid } from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

import type { AppKitConfigObject } from '../constants/appKitConfigs'
import { AccountCard } from './AccountCard'
import { AppKitNetworkInfo } from './AppKitNetworkInfo'

export function AppKitInfoMultiChain({
  config
}: {
  config: AppKitConfigObject[string] | undefined
}) {
  const evmAdapter = config?.adapters?.find(
    adapter => adapter === 'wagmi' || adapter === 'ethers' || adapter === 'ethers5'
  )
  const solanaAdapter = config?.adapters?.find(adapter => adapter === 'solana')
  const bitcoinAdapter = config?.adapters?.find(adapter => adapter === 'bitcoin')

  const currentAccount = useAppKitAccount()
  const evmAccount = useAppKitAccount({ namespace: 'eip155' })
  const solanaAccount = useAppKitAccount({ namespace: 'solana' })
  const bitcoinAccount = useAppKitAccount({ namespace: 'bip122' })

  return (
    <>
      <Grid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
        gap={4}
        marginTop={4}
        marginBottom={4}
      >
        {evmAdapter && <AccountCard account={evmAccount} namespace="eip155" />}
        {solanaAdapter && <AccountCard account={solanaAccount} namespace="solana" />}
        {bitcoinAdapter && <AccountCard account={bitcoinAccount} namespace="bip122" />}
      </Grid>
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
        <AccountCard account={currentAccount} />
        <AppKitNetworkInfo />
      </Grid>
    </>
  )
}
