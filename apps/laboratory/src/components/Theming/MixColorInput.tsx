import {
  Grid,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  useRadioGroup
} from '@chakra-ui/react'
import { colors } from '../../utils/DataUtil'
import RadioColor from './RadioColor'
import { useEffect } from 'react'
import { themeController } from '../../utils/StoreUtil'
import { useProxy } from 'valtio/utils'

export default function MixColorInput() {
  const state = useProxy(themeController.state)

  function handleColorChange(e: string) {
    themeController.setMixColor(e)
    const updatedVariables = { ...state.themeVariables, '--w3m-color-mix': e }
    themeController.setThemeVariables(updatedVariables)
  }

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'mixColor',
    onChange: handleColorChange,
    defaultValue: state.mixColor ? state.mixColor : undefined
  })
  const group = getRootProps()

  useEffect(() => {
    const updatedVariables = {
      ...state.themeVariables,
      '--w3m-color-mix-strength': state.mixColorStrength
    }
    themeController.setThemeVariables(updatedVariables)
  }, [state.mixColorStrength])

  return (
    <>
      <Heading size="sm" fontWeight="400" as="h2">
        Mix Color
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
      <Slider
        min={0}
        max={50}
        value={state.mixColorStrength}
        onChange={val => {
          themeController.setMixColorStrength(val)
        }}
      >
        <SliderMark
          value={state.mixColorStrength}
          textAlign="center"
          bg="blackAlpha.700"
          color="white"
          mt="3"
          ml="-5"
          borderRadius="base"
          w="12"
        >
          {state.mixColorStrength}%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </>
  )
}
