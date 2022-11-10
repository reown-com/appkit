import { useContract, useNetwork, useProvider, useSigner } from '@web3modal/react'
import { useEffect, useState } from 'react'
import goerliUSDC from '../data/goerliUSDC.json'
import wagmigotchiAbi from '../data/wagmigotchiAbi.json'

export default function UseContract() {
  const { network } = useNetwork()
  const chainId = network?.chain?.id
  const { provider } = useProvider({ chainId })
  const { data: signer, isLoading } = useSigner()

  const [hungerData, setHungerData] = useState()

  const goerliHref =
    'https://goerli.etherscan.io/address/0x07865c6e87b9f70255377e024ace6630c1eaa37f#code'
  const mainnetHref = 'https://etherscan.io/address/0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1#code'

  // WagmiGothchi Contract (Mainnet)
  const ethAddress = '0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1'
  // Goerli USDC Contract (Ethereum)
  const goerliAddress = '0x07865c6e87b9f70255377e024ace6630c1eaa37f'

  // 📄 Contract Config
  const contractReadConfig = {
    address: chainId === 1 ? ethAddress : goerliAddress,
    abi: chainId === 1 ? wagmigotchiAbi : goerliUSDC
  }

  const contractConfig = {
    ...contractReadConfig,
    signerOrProvider: signer ? signer : provider
  }

  const { contract } = useContract(contractConfig)

  // eslint-disable-next-line func-style
  async function getHunger() {
    if (contract) {
      const data = await contract.getHunger()
      setHungerData(JSON.stringify(data))
    }
  }

  useEffect(() => {
    // If (contract) getHunger()
  }, [hungerData, isLoading, provider, signer])

  async function feed() {
    if (contract) {
      const tx = await contract.feed()
      const response = await tx.wait()
    }
  }

  return (
    <section>
      <h1>useContract</h1>
      <p>
        This example uses
        <a href={chainId === 1 ? mainnetHref : goerliHref} target="_blank" rel="noopener noreferer">
          {chainId === 1 ? 'WagmiGotchi Contract' : 'USDC Contract'}
        </a>
        on {network?.chain?.name}
      </p>

      <ul>
        <li>
          Contract Address: <span>{contract?.address}</span>
        </li>
        <li>Hunger Data / getHunger call function: {hungerData}</li>
        <li>Feed/ write function:</li>
      </ul>
      <div style={{ display: 'flex' }}>
        <button style={{ marginRight: '1rem' }} onClick={async () => getHunger()}>
          Get Hunger
        </button>
        {/* <button onClick={async () => feed()}>Feed</button> */}
        <button>Feed</button>
      </div>
    </section>
  )
}
