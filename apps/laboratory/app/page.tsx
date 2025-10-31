'use client'

import { Badge } from '@chakra-ui/react'

import { ConfigurationList } from '@/src/components/ConfigurationList'
import {
  bitcoinSdkOptions,
  customSdkOptions,
  ethers5SdkOptions,
  ethersSdkOptions,
  featuredSdkOptions,
  multichainSdkOptions,
  paySdkOptions,
  siwxSdkOptions,
  solanaSdkOptions,
  testingSdkOptions,
  tonSdkOptions,
  wagmiSdkOptions
} from '@/src/utils/DataUtil'

export default function HomePage() {
  return (
    <>
      <ConfigurationList title="Featured" sdkOptions={featuredSdkOptions} />
      <ConfigurationList title="Testing" sdkOptions={testingSdkOptions} />
      <ConfigurationList title="Wagmi" sdkOptions={wagmiSdkOptions} />
      <ConfigurationList title="Solana" sdkOptions={solanaSdkOptions} />
      <ConfigurationList title="Bitcoin" sdkOptions={bitcoinSdkOptions} />
      <ConfigurationList title="Ton" sdkOptions={tonSdkOptions} />
      <ConfigurationList title="Ethers" sdkOptions={ethersSdkOptions} />
      <ConfigurationList title="Ethers 5" sdkOptions={ethers5SdkOptions} />
      <ConfigurationList
        title={
          <>
            AppKit <Badge>⛓️ Multichain</Badge> <Badge>✨ New</Badge>
          </>
        }
        sdkOptions={multichainSdkOptions}
      />
      <ConfigurationList title="SIWX" sdkOptions={siwxSdkOptions} />
      <ConfigurationList title="Pay" sdkOptions={paySdkOptions} />
      <ConfigurationList title="Custom Configurations" sdkOptions={customSdkOptions} />
    </>
  )
}
