import './globals.css'
import { Layout } from './components/Layout/Layout'
import { Routes } from './Routes'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './core/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Routes />
        </Layout>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
