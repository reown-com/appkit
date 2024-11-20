'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppKit } from '@/hooks/use-appkit'
import { ThemeMode } from '@reown/appkit'
import { cn } from '@/lib/utils'
import { useSnapshot } from 'valtio'
import { ThemeStore } from '@/lib/ThemeStore'

const ACCENT_COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6']
const BG_COLORS = ['#202020', '#363636', '#FF573B', '#10B981']

const RADIUS_NAME_VALUE_MAP = {
  '-': 0,
  S: 1,
  M: 2,
  L: 4,
  XL: 6
}

const FONT_OPTIONS = [
  { label: 'KH Teka', value: 'KHTeka' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Futura', value: 'Futura' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Arial', value: 'Arial' }
]

export default function SidebarContentDesign() {
  const { themeMode, updateThemeMode } = useAppKit()
  const { fontFamily } = useSnapshot(ThemeStore.state)

  const [radius, setRadius] = React.useState('M')
  const [accentColor, setAccentColor] = React.useState(ACCENT_COLORS[0])
  const [bgColor, setBgColor] = React.useState(BG_COLORS[0])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-text-secondary">Mode</Label>
        <RadioGroup
          defaultValue={themeMode}
          onValueChange={value => updateThemeMode(value as ThemeMode)}
          className="grid grid-cols-2 gap-2"
        >
          <Label
            htmlFor="light"
            className={cn(
              'flex items-center justify-center rounded-md border border-transparent bg-fg-secondary px-3 py-2 text-sm',
              themeMode === 'light'
                ? 'border-fg-accent bg-fg-accent/10'
                : 'hover:bg-fg-secondary/80'
            )}
          >
            <RadioGroupItem value="light" id="light" className="sr-only" />
            Light
          </Label>
          <Label
            htmlFor="dark"
            className={cn(
              'flex items-center justify-center rounded-md border px-3 py-2 text-sm',
              themeMode === 'dark' && 'border-fg-accent bg-fg-accent/10'
            )}
          >
            <RadioGroupItem value="dark" id="dark" className="sr-only" />
            Dark
          </Label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-text-secondary">Font</Label>
        <RadioGroup
          defaultValue={fontFamily}
          onValueChange={value => ThemeStore.setFontFamily(value)}
          className="grid grid-cols-3 gap-2"
        >
          {FONT_OPTIONS.map(({ label, value }) => (
            <Label
              key={value}
              htmlFor={value}
              className={cn(
                'flex items-center justify-center rounded-md border border-transparent bg-fg-secondary px-3 py-2 text-sm whitespace-nowrap',
                fontFamily === value
                  ? 'border-fg-accent bg-fg-accent/10'
                  : 'hover:bg-fg-secondary/80'
              )}
            >
              <RadioGroupItem value={value} id={value} className="sr-only" />
              {label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-text-secondary">Radius</Label>
        <RadioGroup
          defaultValue={radius}
          onValueChange={value => {
            ThemeStore.setBorderRadius(
              RADIUS_NAME_VALUE_MAP[value as keyof typeof RADIUS_NAME_VALUE_MAP]
            )
            setRadius(value)
          }}
          className="grid grid-cols-5 gap-2"
        >
          {['-', 'S', 'M', 'L', 'XL'].map(size => (
            <Label
              key={size}
              htmlFor={size}
              className={cn(
                'flex items-center justify-center rounded-md border border-transparent bg-fg-secondary px-3 py-2 text-sm',
                radius === size ? 'border-fg-accent bg-fg-accent/10' : 'hover:bg-fg-secondary/80'
              )}
            >
              <RadioGroupItem value={size} id={size} className="sr-only" />
              {size}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-text-secondary">Main</Label>
        <div className="grid grid-cols-5 gap-2">
          {ACCENT_COLORS.map((color, index) => (
            <button
              key={color}
              onClick={() => {
                ThemeStore.setAccentColor(color)
                setAccentColor(color)
              }}
              className={`h-8 rounded-full ${
                accentColor === color
                  ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-zinc-900'
                  : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Color option ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-text-secondary">Background</Label>
        <div className="grid grid-cols-4 gap-2">
          {BG_COLORS.map((color, index) => (
            <button
              key={color}
              onClick={() => {
                ThemeStore.setMixColor(color)
                ThemeStore.setMixColorStrength(8)
                setBgColor(color)
              }}
              className={`h-8 rounded-full ${
                bgColor === color ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-zinc-900' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Background option ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
