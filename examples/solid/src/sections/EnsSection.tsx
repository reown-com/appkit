import { useAccount, useFetchEnsAddress, useFetchEnsAvatar } from '@web3modal/solid'
import { createSignal } from 'solid-js'

export default function EnsSection() {
  const { chainId } = useAccount()()
  const { avatar, isLoading, refetch: fetchAvatar } = useFetchEnsAvatar()
  const { address, refetch: fetchAddress } = useFetchEnsAddress()
  const [ensDomain, setEnsDomain] = createSignal('')

  function onFetch(domain: string) {
    fetchAddress({
      name: domain,
      chainId
    })

    fetchAvatar({
      addressOrName: domain,
      chainId
    })
  }

  return (
    <section>
      <h1>Fetch from ENS</h1>
      <input
        value={ensDomain()}
        onChange={({ currentTarget }) => setEnsDomain(currentTarget.value)}
      />
      <button type="button" disabled={isLoading()} onClick={() => onFetch(ensDomain())}>
        Fetch
      </button>
      <div>
        {avatar() && <img src={avatar() ?? ''} alt="avatar" />}
        {address() && <span>{address()}</span>}
      </div>
    </section>
  )
}
