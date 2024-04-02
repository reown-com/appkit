import { Grid, useRadioGroup } from '@chakra-ui/react'
import { colors } from '../../utils/DataUtil'
import RadioColor from './RadioColor'

import { ThemeStore } from '../../utils/StoreUtil'
import { useProxy } from 'valtio/utils'
import { Span } from '@/components/ui/typography'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Row } from '@/components/ui/row'

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
      <Span className="text-lg">Mix Color</Span>
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

      <Row className="items-center gap-4">
        <Slider
          defaultValue={[10]}
          min={0}
          max={50}
          step={1}
          className={cn('w-[60%]')}
          onValueChange={value => {
            ThemeStore.setMixColorStrength(value[0] || 0)
          }}
        />
        <Span className="mt-0">{state.mixColorStrength}%</Span>
      </Row>
    </>
  )
}
