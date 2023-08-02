import { Button } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'
import { modal } from '../pages/index'

export function NetworksButton() {
  const { chain } = useNetwork()

  return (
    <Button onClick={() => modal.open({ view: 'Networks' })}>{chain?.name ?? 'Networks'}</Button>
  )
}
