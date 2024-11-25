import { Box, useRadio, type RadioProps } from '@chakra-ui/react'

export default function RadioColor(props: RadioProps) {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  const backgroundColor = typeof props.children === 'string' ? props.children : 'transparent'

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        style={{ backgroundColor }}
        cursor="pointer"
        borderRadius="full"
        width="100%"
        aspectRatio="1/1"
        borderWidth="2px"
        borderColor="transparent"
        _checked={{
          borderColor: 'gray.900'
        }}
      ></Box>
    </Box>
  )
}
