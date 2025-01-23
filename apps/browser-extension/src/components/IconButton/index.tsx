import { touchableStyles } from '../../css/touchableStyles'
import { ArrowRightUp } from '../ArrowRightUp'
import { Box } from '../Box'
import { Checkmark } from '../Checkmark'
import { Copy } from '../Copy'
import { Switch } from '../Switch'
import { Text } from '../Text'

const icons = {
  copy: <Copy />,
  checkmark: <Checkmark />,
  arrowRightUp: <ArrowRightUp />,
  switch: <Switch />
}

export type IconButtonKey = keyof typeof icons

interface IconButtonProps {
  onClick: () => void
  icon: IconButtonKey
  label: string
}

export function IconButton({ onClick, icon, label }: IconButtonProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="2">
      <Box
        as="button"
        background="neutrals1000"
        color="white"
        fontSize="16"
        fontWeight="regular"
        textAlign="center"
        padding="3"
        borderRadius="16"
        display="flex"
        alignItems="center"
        justifyContent="center"
        className={touchableStyles({
          active: 'shrink',
          hover: 'grow'
        })}
        onClick={onClick}
      >
        {icons[icon]}
      </Box>

      <Text fontSize="14" color="neutrals400">
        {label}
      </Text>
    </Box>
  )
}
