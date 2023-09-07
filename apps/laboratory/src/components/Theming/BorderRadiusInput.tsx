import {
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack
} from '@chakra-ui/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { useProxy } from 'valtio/utils'

export default function BorderRadiusInput() {
  const state = useProxy(ThemeStore.state)

  return (
    <>
      <Heading size="sm" fontWeight="400" as="h2">
        Border Radius
      </Heading>
      <Slider
        min={0}
        max={10}
        value={parseInt(state.borderRadius.replace('px', ''), 10)}
        onChange={val => {
          ThemeStore.setBorderRadius(`${val}px`)
        }}
      >
        <SliderMark
          value={parseInt(state.borderRadius.replace('px', ''), 10)}
          textAlign="center"
          bg="blackAlpha.700"
          color="white"
          mt="3"
          ml="-5"
          borderRadius="base"
          w="12"
        >
          {state.borderRadius}
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </>
  )
}
