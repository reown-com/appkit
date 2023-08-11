'use client'

import { useEffect } from 'react'
import type { Web3ModalOptions } from './client.js'
import { Web3Modal as Web3ModalCore } from './client.js'

// -- Types -------------------------------------------------------------------
export type Web3ModalProps = Web3ModalOptions

// -- Setup -------------------------------------------------------------------
let modal: Web3ModalCore | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export function Web3Modal(props: Web3ModalProps) {
  useEffect(() => {
    modal = new Web3ModalCore(props)
  }, [])

  return null
}

export function useWeb3Modal() {
  return (() => modal)()
}
