import { useAppKit } from '@/hooks/use-appkit'
import { FeatureButton } from '../feature-button'
import { Input } from '../ui/input'

export function AdvancedFeatures() {
  const { features, updateFeatures, termsConditionsUrl, privacyPolicyUrl, updateUrls } = useAppKit()

  const toggleFeature = (featureName: 'swaps' | 'onramp' | 'termsConditions' | 'privacyPolicy') => {
    updateFeatures({ [featureName]: !features[featureName] })
  }

  const handleUrlChange = (type: 'termsConditions' | 'privacyPolicy', url: string) => {
    updateUrls({ [type]: url })
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
      <div className="space-y-2">
        <FeatureButton
          label="Terms & Conditions"
          isEnabled={features.termsConditions || false}
          onClick={() => toggleFeature('termsConditions')}
        />
        {features.termsConditions && (
          <Input
            placeholder="Enter Terms & Conditions URL"
            value={termsConditionsUrl || ''}
            onChange={e => handleUrlChange('termsConditions', e.target.value)}
            className="mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <FeatureButton
          label="Privacy Policy"
          isEnabled={features.privacyPolicy || false}
          onClick={() => toggleFeature('privacyPolicy')}
        />
        {features.privacyPolicy && (
          <Input
            placeholder="Enter Privacy Policy URL"
            value={privacyPolicyUrl || ''}
            onChange={e => handleUrlChange('privacyPolicy', e.target.value)}
            className="mt-2"
          />
        )}
      </div>
    </div>
  )
}
