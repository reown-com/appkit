import { useState } from 'react'
import { toast } from 'sonner'

export function useUrlState() {
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<any>(null)

  async function saveConfig(config: any) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: btoa(JSON.stringify(config))
        })
      })

      const data = await response.json()

      setIsLoading(false)
      if (response.ok) {
        const url = new URL(window.location.href)
        await navigator.clipboard.writeText(`${url.origin}/${data.id}`)
        return data.id
      } else {
        toast.error('Failed to save configuration')
        return null
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error saving configuration', error)
      toast.error('Error saving configuration')
      return null
    }
  }

  return {
    isLoading,
    config,
    saveConfig
  }
}
