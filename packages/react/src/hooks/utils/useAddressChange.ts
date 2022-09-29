import { useEffect, useState } from 'react'

export function useAddressChange(callback: () => void, address?: string) {
  const [prevAddress, setPrevAddress] = useState(address)

  useEffect(() => {
    if (address && prevAddress && address !== prevAddress) callback()
    setPrevAddress(address)
  }, [address, prevAddress, callback])
}
