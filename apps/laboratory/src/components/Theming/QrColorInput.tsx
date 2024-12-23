import { Grid, Heading, useRadioGroup } from '@chakra-ui/react'
import { colors } from '../../utils/DataUtil'
import RadioColor from './RadioColor'
import { ThemeStore } from '../../utils/StoreUtil'
import { useProxy } from 'valtio/utils'

export default function QrColorInput() {
  const state = useProxy(ThemeStore.state)

  function handleColorChange(e: string) {
    ThemeStore.setQRColor(e)
  }

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'qrColor',
    onChange: handleColorChange,
    defaultValue: state.qrColor ? state.qrColor : undefined
  })

  const group = getRootProps()

  return (
    <>
      <Heading size="sm" fontWeight="400" as="h2">
        QR color
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
