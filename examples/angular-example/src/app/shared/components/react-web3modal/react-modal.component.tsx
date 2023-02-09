import { Web3Modal } from '@web3modal/standalone'
import React from 'react'
// eslint-disable-next-line capitalized-comments
// import SignClient from '@walletconnect/sign-client'

// eslint-disable-next-line func-style
export const ReactModalComponent: React.FC = () => {
  // eslint-disable-next-line capitalized-comments
  // const [signClient, setSignClient] = useState<SignClient | undefined>(undefined)
  const web3Modal = new Web3Modal(Object({ projectId: '5eec3e3ff91ddea25b76615da1e8b668' }))

  // eslint-disable-next-line func-style
  const open = () => {
    web3Modal.openModal(undefined)
  }

  return (
    <div>
      <div>
        <button onClick={open}>connect</button>
      </div>
    </div>
  )
}
