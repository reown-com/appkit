import { Box } from '../Box'
import { Button } from '../Button'
import { ArrowRightUp } from '../ArrowRightUp'
import { Copy } from '../Copy'
import { Text } from '../Text'
import { Checkmark } from '../Checkmark'
import { Switch } from '../Switch'

const icons = {
  copy: <Copy />,
  checkmark: <Checkmark />,
  arrowRightUp: <ArrowRightUp />,
  switch: <Switch />
}

export type IconButtonIconKey = keyof typeof icons

interface IconButtonProps {
  onClick: () => void
  icon: IconButtonIconKey
  text: string
}

export function IconButton({ onClick, icon, text }: IconButtonProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="10">
      <Button
        height="36"
        width="36"
        borderRadius="round"
        active="shrink"
        hover="grow"
        padding="1"
        onClick={onClick}
      >
        {icons[icon]}
      </Button>
      <Text fontSize="14">{text}</Text>
    </Box>
  )
}
