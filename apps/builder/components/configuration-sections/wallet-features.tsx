import { useAppKit } from '@/hooks/use-appkit'
import { WalletFeatureList } from '@/components/list-wallet-features'

export function AdvancedFeatures() {
  const { features, updateFeatures, termsConditionsUrl, privacyPolicyUrl, updateUrls } = useAppKit()

  return (
    <div className="space-y-4 flex-grow">
      <p className="text-sm text-text-secondary">Wallet features</p>
      <WalletFeatureList />

      {/* <p className="text-sm text-text-secondary">Other features</p>
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
      </div> */}
    </div>
  )
}
