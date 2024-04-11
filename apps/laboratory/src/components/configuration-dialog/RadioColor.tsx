import { Column } from '@/components/ui/column'
import { useRadio, type RadioProps } from '@chakra-ui/react'

export default function RadioColor(props: RadioProps) {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  const backgroundColor = typeof props.children === 'string' ? props.children : 'transparent'

  return (
    <Column className="w-full">
      <input {...input} />
      <Column
        {...checkbox}
        className="cursor-pointer rounded-full aspect-square w-full checked:ring-2"
        style={{ backgroundColor }}
      ></Column>
    </Column>
  )
}
