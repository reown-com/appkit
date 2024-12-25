import './globals.css'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './core/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box } from './components/Box'
import { Home } from './pages/Home'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Box
          display="flex"
          justifyContent="center"
          style={{ height: 600, width: 360, margin: '0 auto' }}
        >
          <Home />
        </Box>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
