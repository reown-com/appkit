import { Grid, Heading, useRadioGroup } from '@chakra-ui/react'
import { colors } from '../../utils/DataUtil'
import RadioColor from './RadioColor'
import useThemeStore from '../../utils/StoreUtil'

export default function AccentColorInput() {
  const [themeVariables, setThemeVariables, accentColor, setAccentColor] = useThemeStore(state => [
    state.themeVariables,
    state.setThemeVariables,
    state.accentColor,
    state.setAccentColor
  ])

  function handleColorChange(e: string) {
    setAccentColor(e)
    const updatedVariables = { ...themeVariables, '--w3m-accent': e }
    setThemeVariables(updatedVariables)
  }

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'accentColor',
    onChange: handleColorChange,
    defaultValue: accentColor ? accentColor : undefined
  })
  const group = getRootProps()

  return (
    <>
      <Heading size="sm" fontWeight="400" as="h2">
        Accent Color
      </Heading>
      <Grid templateColumns="repeat(15, 1fr)" gap={2} {...group}>
        {colors.map(value => {
          const radio = getRadioProps({ value })

          return (
            <RadioColor key={value} {...radio}>
              {value}
            </RadioColor>
          )
        })}
      </Grid>
    </>
  )
}
