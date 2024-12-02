import { Box } from '../Box'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{ height: 600, width: 360, margin: '0 auto' }}
    >
      {children}
    </Box>
  )
}
