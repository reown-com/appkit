import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { Box } from './components/Box'
import { wagmiConfig } from './core/wagmi'
import './globals.css'
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
