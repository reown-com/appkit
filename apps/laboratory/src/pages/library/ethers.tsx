import { resetAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { mainnet } from '@reown/appkit/networks'
import { useEffect, useState } from 'react'
import { useOptions } from '../../context/OptionsContext'
import { Spinner } from '@chakra-ui/react'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new EthersAdapter()

export default function Ethers() {
  const { options } = useOptions()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    console.log('>>> options', options)
    const modal = resetAppKit({
      ...options,
      adapters: [ethersAdapter],
      networks,
      defaultNetwork: mainnet
    })

    console.log('>> modal', modal)

    ThemeStore.setModal(modal)
    setReady(true)
  }, [options])

  return ready ? (
    <>
      <AppKitButtons />
      <EthersModalInfo />
      <EthersTests />
    </>
  ) : (
    <Spinner />
  )
}
