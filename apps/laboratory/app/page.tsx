'use client'

import { Badge } from '@chakra-ui/react'

import { ConfigurationList } from '@/src/components/ConfigurationList'
import {
  bitcoinSdkOptions,
  ethers5SdkOptions,
  ethersSdkOptions,
  featuredSdkOptions,
  multichainSdkOptions,
  siwxSdkOptions,
  solanaSdkOptions,
  testingSdkOptions,
  wagmiSdkOptions
} from '@/src/utils/DataUtil'

export default function HomePage() {
  return (
    <>
      <ConfigurationList title="Featured" sdkOptions={featuredSdkOptions} />
      <ConfigurationList title="Testing" sdkOptions={testingSdkOptions} />
      <ConfigurationList title="Wagmi" sdkOptions={wagmiSdkOptions} />
      <ConfigurationList title="Ethers" sdkOptions={ethersSdkOptions} />
      <ConfigurationList title="Ethers 5" sdkOptions={ethers5SdkOptions} />
      <ConfigurationList title="Solana" sdkOptions={solanaSdkOptions} />
      <ConfigurationList title="Bitcoin" sdkOptions={bitcoinSdkOptions} />
      <ConfigurationList
        title={
          <>
            AppKit <Badge>⛓️ Multichain</Badge> <Badge>✨ New</Badge>
          </>
        }
        sdkOptions={multichainSdkOptions}
      />
      <ConfigurationList title="SIWX" sdkOptions={siwxSdkOptions} />
    </>
  )
}
