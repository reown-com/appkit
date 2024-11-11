import { Badge } from '@chakra-ui/react'
import {
  wagmiSdkOptions,
  ethersSdkOptions,
  solanaSdkOptions,
  ethers5SdkOptions,
  featuredSdkOptions,
  multichainSdkOptions,
  testingSdkOptions,
  bitcoinSdkOptions
} from '../utils/DataUtil'
import { ConfigurationList } from '../components/ConfigurationList'

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
    </>
  )
}
