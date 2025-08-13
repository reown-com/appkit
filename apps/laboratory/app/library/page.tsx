'use client'

import { useEffect, useState } from 'react'

import { Button } from '@chakra-ui/react'

import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const ethersAdapter = new EthersAdapter()

const config = {
  enableNetworkSwitch: false,
  enableWalletGuide: false,
  features: {
    analytics: true,
    socials: [],
    allWallets: true,
    email: false,
    send: false,
    onramp: false,
    receive: false
  },
  networks: ConstantsUtil.EvmNetworks,
  projectId: process.env['NEXT_PUBLIC_PROJECT_ID'] || '',
  customWallets: ConstantsUtil.CustomWallets,
  adapters: [ethersAdapter]
}

let reownModal = createAppKit(config)

export default function Library() {
  const [excludeIds, setExcludeIds] = useState<boolean>(false)

  function toggle() {
    reownModal = createAppKit({
      ...config,
      excludeWalletIds: excludeIds
        ? undefined
        : ['a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393']
    })
    setExcludeIds(!excludeIds)
  }

  return (
    <div>
      <appkit-button />
      {reownModal && (
        <Button onClick={toggle}>{excludeIds ? 'Include Phantom' : 'Exclude Phantom'}</Button>
      )}
    </div>
  )
}
