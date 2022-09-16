import { useFetchEnsAvatar, useFetchEnsAddress, useAccount } from '@web3modal/react'
import { useCallback, useState } from 'react'

export default function EnsSection() {
  const { chainId } = useAccount()
  const { avatar, isLoading, refetch: fetchAvatar } = useFetchEnsAvatar()
  const { address, refetch: fetchAddress } = useFetchEnsAddress()
  const [ensDomain, setEnsDomain] = useState('')

  const onFetch = useCallback(
    (domain: string) => {
      fetchAddress({
        name: domain,
        chainId
      })

      fetchAvatar({
        addressOrName: domain,
        chainId
      })
    },
    [fetchAddress, fetchAvatar]
  )

  return (
    <section>
      <h1>Fetch from ENS</h1>
      <input value={ensDomain} onChange={({ target }) => setEnsDomain(target.value)} />
      <button type="button" disabled={isLoading} onClick={() => onFetch(ensDomain)}>
        Fetch
      </button>
      <div>
        {avatar && <img src={avatar} alt="avatar" />}
        {address && <span>{address}</span>}
      </div>
    </section>
  )
}
