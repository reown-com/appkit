import { Box, BoxProps } from '../Box'

const defaultProps: BoxProps = {
  as: 'p',
  color: 'neutrals1000',
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
