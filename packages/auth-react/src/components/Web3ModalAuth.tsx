import type { Web3ModalAuthOptions } from '@web3modal/auth-html'
import { memo, useEffect } from 'react'
import { setWeb3ModalAuthClient } from '../client'

// -- Types --------------------------------------------------------------------
export type Web3ModalAuthProps = Web3ModalAuthOptions

function Web3ModalAuthComp(props: Web3ModalAuthProps) {
  useEffect(() => {
    setWeb3ModalAuthClient(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export const Web3ModalAuth = memo(Web3ModalAuthComp)
