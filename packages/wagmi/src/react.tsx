'use client'

import { useEffect } from 'react'
import type { Web3ModalOptions } from './client'
import { Web3Modal as Web3ModalCore } from './client'

let modal: Web3ModalCore | undefined = undefined

export type Web3ModalProps = Web3ModalOptions

export function Web3Modal(props: Web3ModalProps) {
  useEffect(() => {
    modal = new Web3ModalCore(props)
  }, [])

  return null
}

export function useWeb3Modal() {
  if (!modal) {
    throw new Error('useWeb3Modal hook used before <Web3Modal /> component was mounted')
  }

  return modal
}
