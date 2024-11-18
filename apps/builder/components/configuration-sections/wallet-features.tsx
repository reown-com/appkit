import { useAppKit } from '@/contexts/AppKitContext'
import { FeatureButton } from '../feature-button'

export function AdvancedFeatures() {
  const { features, updateFeatures } = useAppKit()

  const toggleFeature = (featureName: 'swaps' | 'onramp') => {
    updateFeatures({ [featureName]: !features[featureName] })
  }

  return (
    <div className="space-y-4 flex-grow">
      <p className="text-sm text-text-secondary">Wallet features</p>
      <FeatureButton
        label="Buy"
        isEnabled={features.onramp || false}
        onClick={() => toggleFeature('onramp')}
      />
      <FeatureButton
        label="Swap"
        isEnabled={features.swaps || false}
        onClick={() => toggleFeature('swaps')}
      />
      <p className="text-sm text-text-secondary">Other features</p>
      <FeatureButton
        label="Terms & Conditions"
        isEnabled={false}
        onClick={() => toggleFeature('swaps')}
      />
    </div>
  )
}
