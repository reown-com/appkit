import { type AppKitSdkVersion, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { StorageUtil } from '@reown/appkit-controllers'

import { ConstantsUtil } from './ConstantsUtil.js'

export const SemVerUtils = {
  extractVersion(version: string | undefined) {
    if (!version || typeof version !== 'string') {
      return null
    }

    /*
     * Match semantic version patterns with optional pre-release suffixes and version range operators
     * Examples: 1.7.1, 1.7.1-canary.3, 1.7.1-beta.1, 1.7, 1, ^1.8.3, >=1.x.x, <=1.x.x, etc.
     */
    const versionRegex = /(?:[~^>=<]+\s*)?(?<version>\d+(?:\.\d+){0,2})(?:-[a-zA-Z]+\.\d+)?/u
    const match = version.match(versionRegex)

    return match?.groups?.['version'] || null
  },

  checkSDKVersion(version: AppKitSdkVersion) {
    const packageVersion = this.extractVersion(version)
    const isDevelopment = CommonConstantsUtil.IS_DEVELOPMENT

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
    return typeof version === 'string' && /^\d+\.\d+\.\d+$/u.test(version)
  },

  isOlder(currentVersion: string, latestVersion: string) {
    const currentVersionNumber = this.extractVersion(currentVersion)
    const latestVersionNumber = this.extractVersion(latestVersion)

    if (!currentVersionNumber || !latestVersionNumber) {
      return false
    }

    // Normalize versions to ensure they have at least 3 parts
    function normalizeVersion(version: string) {
      const parts = version.split('.').map(Number)
      while (parts.length < 3) {
        parts.push(0)
      }

      return parts
    }

    const current = normalizeVersion(currentVersionNumber)
    const latest = normalizeVersion(latestVersionNumber)

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
