import { useContract, useNetwork, useProvider } from '@web3modal/react'
import { useState } from 'react'
import goerliUSDC from '../data/goerliUSDC.json'
import wagmigotchiAbi from '../data/wagmigotchiAbi.json'

export default function UseContract() {
  const { network } = useNetwork()
  const chainId = network?.chain?.id
  const { provider } = useProvider({ chainId })
  // Const { data: signer, isLoading } = useSigner()

  const [hungerData, setHungerData] = useState()

  // WagmiGothchi Contract (Mainnet) / Goerli USDC Contract (Goerli)
  const goerliHref =
    'https://goerli.etherscan.io/address/0x07865c6e87b9f70255377e024ace6630c1eaa37f#code'
  const mainnetHref = 'https://etherscan.io/address/0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1#code'

  const ethAddress = '0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1'
  const goerliAddress = '0x07865c6e87b9f70255377e024ace6630c1eaa37f'

  // eslint-disable-next-line no-warning-comments
  // ToDo: Debug why signer is not passing properly in signerOrProvider
  const contractConfig = {
    address: chainId === 1 ? ethAddress : goerliAddress,
    abi: chainId === 1 ? wagmigotchiAbi : goerliUSDC,
    signerOrProvider: provider
  }

  const { contract } = useContract(contractConfig)

  async function getHunger() {
    if (contract) {
      const data = await contract.getHunger()
      setHungerData(data)
    }
  }

  // eslint-disable-next-line no-warning-comments
  // ToDo: Add the contract action calls for Goerli USDC Contract
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
        <li>Hunger Data / getHunger call function: {JSON.stringify(hungerData)}</li>
      </ul>
      <div style={{ display: 'flex' }}>
        <button style={{ marginRight: '1rem' }} onClick={async () => getHunger()}>
          Get Hunger
        </button>
      </div>
    </section>
  )
}
