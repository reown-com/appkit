import React from 'react'
import { useAppKit } from '../config'

enum DataTests {
  connect_wallet_button = 'connect-wallet-button'
}

interface ButtonProps {
  className?: string
}

export function Button({ className = 'w-full' }: ButtonProps) {
  const { open } = useAppKit()

  return (
    <button 
      onClick={() => open()} 
      className={className} 
      data-test={DataTests.connect_wallet_button}
    >
      Connect wallet
    </button>
  )
}

export default Button
