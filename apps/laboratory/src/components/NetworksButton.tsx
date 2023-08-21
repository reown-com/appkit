import { Button } from '@chakra-ui/react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useNetwork } from 'wagmi'

export function NetworksButton() {
  const { chain } = useNetwork()
  const modal = useWeb3Modal()

  return (
    <Button onClick={() => modal.open({ view: 'Networks' })}>{chain?.name ?? 'Networks'}</Button>
  )
}
