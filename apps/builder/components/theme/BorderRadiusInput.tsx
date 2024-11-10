import { Label } from '@/components/ui/label'
import { useSnapshot } from 'valtio'
import { ThemeStore } from '@/lib/ThemeStore'
import { Slider } from '@/components/ui/slider'

export default function BorderRadiusInput() {
  const { borderRadius } = useSnapshot(ThemeStore.state)
  const numericValue = parseInt(borderRadius)

  return (
    <div className="space-y-2">
      <Label>Border Radius: {numericValue}px</Label>
      <Slider
        defaultValue={[numericValue]}
        max={8}
        step={1}
        onValueChange={([value]) => {
          ThemeStore.setBorderRadius(value)
        }}
      />
    </div>
  )
}
