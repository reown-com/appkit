import { Box, BoxProps } from '../Box'

const defaultProps: BoxProps = {
  as: 'p',
  color: 'textSecondary',
  fontSize: '16',
  fontWeight: 'regular'
}

export function Text({ children, ...rest }: BoxProps) {
  return (
    <Box {...defaultProps} {...rest}>
      {children}
    </Box>
  )
}
