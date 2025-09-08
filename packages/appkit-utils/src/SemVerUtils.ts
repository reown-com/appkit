import type { AppKitSdkVersion } from '@reown/appkit-common'
import { CoreHelperUtil, StorageUtil } from '@reown/appkit-controllers'

import { ConstantsUtil } from './ConstantsUtil.js'

export const SemVerUtils = {
  checkSDKVersion(version: AppKitSdkVersion) {
    const packageVersion = version.split('-')[2]
    const isDevelopment = CoreHelperUtil.isDevelopment()

    if (!packageVersion || !isDevelopment) {
      return
    }

    const appKitVersionStorage = StorageUtil.getLatestAppKitVersion()

    if (this.isValidVersion(appKitVersionStorage)) {
      if (this.isOlder(packageVersion, appKitVersionStorage)) {
        console.warn(
          ConstantsUtil.getSDKVersionWarningMessage(packageVersion, appKitVersionStorage)
        )

        return
      }
    }

    try {
      fetch('https://registry.npmjs.org/@reown/appkit/latest')
        .then(response => response.json())
        .then(data => {
          const latestVersion = data.version
          if (this.isOlder(packageVersion, latestVersion)) {
            StorageUtil.updateLatestAppKitVersion({ timestamp: Date.now(), version: latestVersion })
            console.warn(ConstantsUtil.getSDKVersionWarningMessage(packageVersion, latestVersion))
          }
        })
    } catch (error) {
      // Ignore error
    }
  },

  isValidVersion(version: string | undefined) {
    return version?.match(/^\d+\.\d+\.\d+$/u)
  },

  isOlder(currentVersion: string, latestVersion: string) {
    const currentVersionMatch = currentVersion.match(/(?:\d+\.\d+\.\d+)/u)
    const currentVersionNumber = currentVersionMatch ? currentVersionMatch[1] : currentVersion

    if (!currentVersionNumber || !latestVersion) {
      return false
    }

    const current = currentVersionNumber.split('.').map(Number)
    const latest = latestVersion.split('.').map(Number)

    for (let i = 0; i < Math.max(current.length, latest.length); i += 1) {
      const currentPart = current[i] || 0
      const latestPart = latest[i] || 0

      if (currentPart < latestPart) {
        return true
      } else if (currentPart > latestPart) {
        return false
      }
    }

    return false
  }
}
