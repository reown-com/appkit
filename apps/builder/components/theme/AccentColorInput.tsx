import { Label } from '@/components/ui/label'
import { ThemeStore } from '@/lib/ThemeStore'
import { Button } from '@/components/ui/button'
import { useSnapshot } from 'valtio'

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AccentColorInput() {
  const { accentColor } = useSnapshot(ThemeStore.state)

  return (
    <div className="space-y-2">
      <Label>Accent Color</Label>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_COLORS.map(color => (
          <Button
            key={color}
            onClick={() => ThemeStore.setAccentColor(color)}
            className="w-8 h-8 p-0 rounded-md"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}
