import { useSignTypedData } from '@web3modal/react'

const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
}

const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' }
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' }
  ]
}

const value = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
  },
  contents: 'Hello, Bob!'
}

export default function AccountSection() {
  const { isLoading, sign, signature } = useSignTypedData()

  function onSignTypedData() {
    sign({ domain, value, types })
  }

  return (
    <section>
      <h1>Sign Typed Data</h1>
      <button type="button" disabled={isLoading} onClick={onSignTypedData}>
        Sign Typed Data
      </button>
      {signature ? <p>{signature}</p> : null}
    </section>
  )
}
