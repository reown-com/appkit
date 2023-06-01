import type { Web3ModalSignOptions } from '@web3modal/sign-html'
import { memo, useEffect } from 'react'
import { setWeb3ModalSignClient } from '../client'

// -- Types --------------------------------------------------------------------
export type Web3ModalSignProps = Web3ModalSignOptions

function Web3ModalSignComp(props: Web3ModalSignProps) {
  useEffect(() => {
    setWeb3ModalSignClient(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export const Web3ModalSign = memo(Web3ModalSignComp)
