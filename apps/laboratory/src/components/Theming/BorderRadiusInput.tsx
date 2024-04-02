import { ThemeStore } from '../../utils/StoreUtil'
import { useProxy } from 'valtio/utils'
import { cn } from '@/lib/utils'
import { Span } from '@/components/ui/typography'
import { Row } from '@/components/ui/row'
import { Slider } from '@/components/ui/slider'

export default function BorderRadiusInput() {
  const state = useProxy(ThemeStore.state)

  return (
    <>
      <Span className="text-lg">Border Radius</Span>

      <Row className="items-center gap-4">
        <Slider
          defaultValue={[2]}
          min={0}
          max={10}
          step={1}
          className={cn('w-[60%]')}
          onValueChange={value => {
            ThemeStore.setBorderRadius(`${value[0] || 0}px`)
          }}
        />
        <Span className="mt-0">{state.borderRadius}</Span>
      </Row>
    </>
  )
}
