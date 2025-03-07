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
import { useProxy } from 'valtio/utils'

import { colors } from '@/src/utils/DataUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

import RadioColor from './RadioColor'

export default function MixColorInput() {
  const state = useProxy(ThemeStore.state)

  function handleColorChange(e: string) {
    ThemeStore.setMixColor(e)
  }

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'mixColor',
    onChange: handleColorChange,
    defaultValue: state.mixColor ? state.mixColor : undefined
  })

  const group = getRootProps()

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
          ThemeStore.setMixColorStrength(val)
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
