import * as React from 'react'
import styled from 'styled-components'
import Web3 from 'web3'
import Web3Connect from 'web3connect'
import Column from './components/Column'
import Wrapper from './components/Wrapper'
import Header from './components/Header'
import Loader from './components/Loader'
import AccountAssets from './components/AccountAssets'
import { apiGetAccountAssets } from './helpers/api'
import { getChainIdFromNetworkId } from './helpers/utilities'
import { IAssetData } from './helpers/types'

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`

const SLanding = styled(Column)`
  height: 600px;
`

const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`

interface IAppState {
  fetching: boolean
  address: string
  web3Instance: Web3 | null
  connected: boolean
  chainId: number
  networkId: number
  assets: IAssetData[]
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: '',
  web3Instance: null,
  connected: false,
  chainId: 1,
  networkId: 1,
  assets: []
}

let injectedWeb3Interval: any = null

class App extends React.Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE
  }

  public onConnect = async (provider: any) => {
    const web3Instance = new Web3(provider)
    const accounts = await web3Instance.eth.getAccounts()
    const networkId = await web3Instance.eth.net.getId()
    const chainId = getChainIdFromNetworkId(networkId)

    injectedWeb3Interval = setInterval(
      () => this.checkInjectedWeb3Account(),
      100
    )

    await this.setState({
      web3Instance,
      connected: true,
      address: accounts[0],
      chainId,
      networkId
    })
    await this.getAccountAssets()
  }

  public checkInjectedWeb3Account = async () => {
    const { web3Instance, address, chainId } = this.state
    if (!web3Instance) {
      return
    }
    const accounts = await web3Instance.eth.getAccounts()
    if (accounts[0] !== address) {
      this.onSessionUpdate(accounts, chainId)
    }
  }

  public onSessionUpdate = async (accounts: string[], chainId: number) => {
    const address = accounts[0]
    await this.setState({ chainId, accounts, address })
    await this.getAccountAssets()
  }

  public getAccountAssets = async () => {
    const { address, chainId } = this.state
    this.setState({ fetching: true })
    try {
      // get account balances
      const assets = await apiGetAccountAssets(address, chainId)

      await this.setState({ fetching: false, assets })
    } catch (error) {
      console.error(error) // tslint:disable-line
      await this.setState({ fetching: false })
    }
  }

  public resetApp = () => {
    clearInterval(injectedWeb3Interval)
    this.setState({ ...INITIAL_STATE })
  }

  public render = () => {
    const { fetching, connected, address, chainId, assets } = this.state
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : !!assets && !!assets.length ? (
              <SBalances>
                <h3>Balances</h3>
                <AccountAssets chainId={chainId} assets={assets} />{' '}
              </SBalances>
            ) : (
              <SLanding center>
                <h3>{`Try out Web3Connect`}</h3>
                <Web3Connect
                  onConnect={(provider: any) => {
                    console.log('[Web3Connect] onConnect', provider) // tslint:disable-line
                    this.onConnect(provider)
                  }}
                  onClose={() => {
                    console.log('[Web3Connect] onClose') // tslint:disable-line
                  }}
                />
              </SLanding>
            )}
          </SContent>
        </Column>
      </SLayout>
    )
  }
}

export default App
