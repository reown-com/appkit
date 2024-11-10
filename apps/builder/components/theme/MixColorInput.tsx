import { Label } from '@/components/ui/label'
import { ThemeStore } from '@/lib/ThemeStore'
import { Button } from '@/components/ui/button'
import { useSnapshot } from 'valtio'
import { Slider } from '@/components/ui/slider'

const colors = [
  '#3da5ff',
  '#00b9a8',
  '#83f3b8',
  '#74dc2e',
  '#afbf8d',
  '#ffe272',
  '#f1d299',
  '#986a33',
  '#ff9351',
  '#eba39c',
  '#ff3737',
  '#a72626',
  '#ff74bc',
  '#bf51e0',
  '#414796'
]

export default function MixColorInput() {
  const { mixColor, mixColorStrength } = useSnapshot(ThemeStore.state)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Mix Color</Label>
        <div className="flex items-center flex-wrap gap-2">
          {colors.map(color => (
            <Button
              key={color}
              onClick={() => ThemeStore.setMixColor(color)}
              className="w-8 h-8 p-0 rounded-md"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Mix Strength: {mixColorStrength}%</Label>
        <Slider
          defaultValue={[mixColorStrength]}
          max={50}
          step={1}
          onValueChange={([value]) => {
            ThemeStore.setMixColorStrength(value)
          }}
        />
      </div>
    </div>
  )
}
