import { useAppKit } from '@reown/appkit/react'

import Wallet from '@/components/general/Icon/Wallet'

import './ConnectWalletButton.scss'

const ConnectWalletButton: React.FC = () => {
  const modal = useAppKit()

  return (
    <>
      <button
        onClick={() => {
          modal.open()
        }}
        className="ConnectWalletButton"
      >
        <Wallet />
      </button>
    </>
  )
}

export default ConnectWalletButton
