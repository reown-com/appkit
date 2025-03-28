/* eslint-disable no-nested-ternary */
import { type ChainAdapter, type SdkVersion, type SocialProvider } from '@reown/appkit-core'

import { type AppKitOptions } from '../utils/TypesUtil.js'

interface AppKitOptionsWithSdk extends AppKitOptions {
  sdkVersion: SdkVersion
}

const PLAN_API_URL =
  'https://api-web3modal-auth-staging.walletconnect-v1-bridge.workers.dev/plans/v1/appkit/config?projectId=017a80231854c3b1c56df7bb46bba859&st=w3m&sv=react-ethers-5.1.3'
export const ConfigUtil = {
  async checkConfig(options: AppKitOptionsWithSdk) {
    const config: {
      currentPlan: 'free' | 'pro' | 'enterprise'
      socials: SocialProvider[] | false | undefined
      networks: ('eip155' | 'solana' | 'bitcoin')[]
    } = await fetch(PLAN_API_URL, {
      method: 'GET'
    }).then(res => res.json())

    console.log(config)

    // const errors: string[] = []

    // const socials = this.checkSocials(config.socials, options?.features?.socials, errors)
    // const networks = this.checkNetworks(config.networks, options?.adapters, errors)

    // if (errors.length > 0) {
    //   console.error(errors)
    // }

    return {
      ...options
    }
  },

  checkSocials(
    cloudConfig: SocialProvider[] | undefined | false,
    localSocialsConfig: SocialProvider[] | undefined | false,
    errors: string[]
  ) {
    console.log(cloudConfig, localSocialsConfig)

    if (localSocialsConfig && !arraysEqualIgnoreOrder(cloudConfig, localSocialsConfig)) {
      errors.push('Socials config mismatch. We override the cloud config with the local config.')
    }

    function arraysEqualIgnoreOrder(
      a: SocialProvider[] | undefined | false,
      b: SocialProvider[] | undefined | false
    ): boolean {
      if (!a || !b) {
        return false
      }
      if (a.length !== b.length) {
        return false
      }
      const sortedA = [...a].sort()
      const sortedB = [...b].sort()

      return JSON.stringify(sortedA) === JSON.stringify(sortedB)
    }

    return cloudConfig
  },

  checkNetworks(
    networks: string[] | undefined,
    adapters: ChainAdapter[] | undefined,
    errors: string[]
  ) {
    console.log(networks, adapters)

    if (!networks || networks.length === 0) {
      if (adapters?.length && adapters.length > 0) {
        errors.push('No networks configured in cloud. Returning zero adapters.')
      }

      return []
    }

    const validAdapters =
      adapters?.filter(
        adapter => adapter?.namespace !== undefined && networks.includes(adapter.namespace)
      ) || []

    if (validAdapters.length !== adapters?.length) {
      errors.push('Network config mismatch. Only returning valid adapters.')
    }

    return validAdapters
  }
}
