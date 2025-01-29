import { Account } from './components/Account'
import { Connectors } from './components/Connectors'

export default function App() {
  return (
    <main>
      <h1>Ethereum Provider Wagmi Example</h1>
      <Connectors />
      <hr />
      <Account />
    </main>
  )
}
