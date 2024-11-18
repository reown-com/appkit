'use client'

import React from 'react'
import { useAppKit } from '@/hooks/use-appkit'
import { ThemeMode, ThemeVariables, Features } from '@reown/appkit/core'

export const AppKitConfig: React.FC = () => {
  const {
    themeMode,
    themeVariables,
    features,
    updateThemeMode,
    updateThemeVariables,
    updateFeatures
  } = useAppKit()

  const handleThemeModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateThemeMode(e.target.value as ThemeMode)
  }

  const handleThemeVariableChange = (key: keyof ThemeVariables, value: string) => {
    updateThemeVariables({ [key]: value })
  }

  const handleFeatureToggle = (key: keyof Features) => {
    updateFeatures({ [key]: !features[key] })
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">AppKit Configuration</h2>

      <div className="mb-4">
        <label className="block mb-2">Theme Mode:</label>
        <select
          value={themeMode}
          onChange={handleThemeModeChange}
          className="w-full p-2 border rounded"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Theme Variables:</h3>
        {Object.entries(themeVariables).map(([key, value]) => (
          <div key={key} className="mb-2">
            <label className="block">{key}:</label>
            <input
              type="text"
              value={value as string}
              onChange={e => handleThemeVariableChange(key as keyof ThemeVariables, e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Features:</h3>
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!value}
                onChange={() => handleFeatureToggle(key as keyof Features)}
                className="mr-2"
              />
              {key}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
