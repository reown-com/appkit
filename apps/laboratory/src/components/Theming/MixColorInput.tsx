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
import useThemeStore from '../../utils/StoreUtil'

export default function MixColorInput() {
  const [
    themeVariables,
    setThemeVariables,
    mixColorStrength,
    setMixColorStrength,
    mixColor,
    setMixColor
  ] = useThemeStore(state => [
    state.themeVariables,
    state.setThemeVariables,
    state.mixColorStrength,
    state.setMixColorStrength,
    state.mixColor,
    state.setMixColor
  ])

  function handleColorChange(e: string) {
    setMixColor(e)
    const updatedVariables = { ...themeVariables, '--w3m-color-mix': e }
    setThemeVariables(updatedVariables)
  }

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'mixColor',
    onChange: handleColorChange,
    defaultValue: mixColor ? mixColor : undefined
  })
  const group = getRootProps()

  useEffect(() => {
    const updatedVariables = { ...themeVariables, '--w3m-color-mix-strength': mixColorStrength }
    setThemeVariables(updatedVariables)
  }, [mixColorStrength])

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
        value={mixColorStrength}
        onChange={val => {
          setMixColorStrength(val)
        }}
      >
        <SliderMark
          value={mixColorStrength}
          textAlign="center"
          bg="blackAlpha.700"
          color="white"
          mt="3"
          ml="-5"
          borderRadius="base"
          w="12"
        >
          {mixColorStrength}%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </>
  )
}
