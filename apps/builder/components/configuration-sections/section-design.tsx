'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppKitContext } from '@/hooks/use-appkit'
import { ThemeMode } from '@reown/appkit/react'
import { cn } from '@/lib/utils'
import { useSnapshot } from 'valtio'
import { ThemeStore } from '@/lib/theme-store'
import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Image from 'next/image'
import { ACCENT_COLORS, BG_COLORS, RADIUS_NAME_VALUE_MAP, FONT_OPTIONS } from '@/lib/constants'

export function SectionDesign() {
  const { config, updateThemeMode } = useAppKitContext()
  const { fontFamily, mixColor, accentColor, borderRadius } = useSnapshot(ThemeStore.state)
  const [radius, setRadius] = React.useState('M')

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-text-secondary">Mode</Label>
        <RadioGroup
          defaultValue={config.themeMode}
          onValueChange={value => updateThemeMode(value as ThemeMode)}
          className="grid grid-cols-2 gap-2"
        >
          <Label
            htmlFor="light"
            className={cn(
              'flex items-center justify-center rounded-md border border-transparent bg-fg-secondary hover:bg-fg-tertiary px-3 py-2 text-sm transition-colors',
              config.themeMode === 'light'
                ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10'
                : ''
            )}
          >
            <RadioGroupItem value="light" id="light" className="sr-only" />
            Light
          </Label>
          <Label
            htmlFor="dark"
            className={cn(
              'flex items-center justify-center rounded-md border bg-fg-secondary hover:bg-fg-tertiary px-3 py-2 text-sm transition-colors',
              config.themeMode === 'dark'
                ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10'
                : null
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
                'flex items-center justify-center rounded-md border border-transparent bg-fg-secondary hover:bg-fg-tertiary px-3 py-2 text-sm whitespace-nowrap transition-colors',
                fontFamily === value ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10' : ''
              )}
              style={{ fontFamily: value }}
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
                'flex items-center justify-center rounded-md border border-transparent bg-fg-secondary hover:bg-fg-tertiary px-3 py-2 text-sm transition-colors',
                borderRadius === RADIUS_NAME_VALUE_MAP[size as keyof typeof RADIUS_NAME_VALUE_MAP]
                  ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10'
                  : ''
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
              }}
              className={cn(
                'flex items-center justify-center p-4 rounded-2xl transition-colors bg-fg-secondary hover:bg-fg-tertiary border border-transparent h-[38px]',
                accentColor === color
                  ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10'
                  : null
              )}
              aria-label={`Color option ${index + 1}`}
            >
              <div
                className="w-4 h-4 rounded-2xl inset-shadow"
                style={{ backgroundColor: color }}
              ></div>
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-center p-4 rounded-2xl transition-colors bg-fg-secondary hover:bg-fg-tertiary border border-transparent h-[38px]',
                  !ACCENT_COLORS.includes(accentColor) && accentColor !== ''
                    ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10'
                    : null
                )}
                aria-label="Custom color picker"
              >
                <Image
                  src="/color-picker-icon.png"
                  alt="Color picker icon"
                  objectFit="cover"
                  width={16}
                  height={16}
                  className="rounded-2xl aspect-square"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <HexColorPicker color={accentColor} onChange={ThemeStore.setAccentColor} />
            </PopoverContent>
          </Popover>
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
                ThemeStore.setMixColorStrength(10)
              }}
              className={cn(
                'flex items-center justify-center p-4 rounded-2xl transition-colors bg-fg-secondary hover:bg-fg-tertiary border border-transparent h-[38px]',
                mixColor === color ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10' : null
              )}
              aria-label={`Background option ${index + 1}`}
            >
              <div
                className="w-4 h-4 rounded-2xl inset-shadow"
                style={{ backgroundColor: color }}
              ></div>
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-center p-4 rounded-2xl transition-colors bg-fg-secondary hover:bg-fg-tertiary border border-transparent h-[38px]',
                  !BG_COLORS.includes(mixColor) && mixColor !== ''
                    ? 'border-fg-accent bg-fg-accent/10 hover:bg-fg-accent/10'
                    : null
                )}
                aria-label="Custom background color picker"
              >
                <Image
                  src="/color-picker-icon.png"
                  alt="Color picker icon"
                  objectFit="cover"
                  width={16}
                  height={16}
                  className="rounded-2xl aspect-square"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <HexColorPicker
                color={mixColor}
                onChange={color => {
                  ThemeStore.setMixColor(color)
                  ThemeStore.setMixColorStrength(8)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
