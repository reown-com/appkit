import { touchableStyles, TouchableStylesParameters } from '../../css/touchableStyles'
import { Box, BoxProps } from '../Box'

const defaultProps = {
  as: 'button',
  background: 'productCloud',
  color: 'textPrimary',
  fontSize: '16',
  fontWeight: 'regular',
  textAlign: 'center',
  padding: '12',
  borderRadius: '16'
} as BoxProps

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function Button({ active, hover, children, ...rest }: TouchableStylesParameters & BoxProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...(active || hover
        ? {
            transition: 'transform',
            className: touchableStyles({
              active,
              hover
            })
          }
        : {})}
      {...defaultProps}
      {...rest}
    >
      {children}
    </Box>
  )
}
