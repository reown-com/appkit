import { Grid, Heading, useRadioGroup } from '@chakra-ui/react'
import { useProxy } from 'valtio/utils'

import { colors } from '@/src/utils/DataUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

import RadioColor from './RadioColor'

export default function AccentColorInput() {
  const state = useProxy(ThemeStore.state)

  function handleColorChange(e: string) {
    ThemeStore.setAccentColor(e)
  }

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'accentColor',
    onChange: handleColorChange,
    defaultValue: state.accentColor ? state.accentColor : undefined
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
