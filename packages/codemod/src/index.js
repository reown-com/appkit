#!/usr/bin/env node
import fs from 'fs'
import latestVersion from 'latest-version'
import path from 'path'

// Function to update wagmi dependencies in all relevant package.json files
async function updateWagmiDependencies() {
  // Define the root directory and directories to search
  const rootDir = path.resolve(new URL('.', import.meta.url).pathname, '../../../')
  const directoriesToSearch = ['packages', 'examples', 'apps']
  const latest = await latestVersion('wagmi')

  // Iterate over each base directory
  for (const baseDir of directoriesToSearch) {
    const basePath = path.join(rootDir, baseDir)
    const subDirectories = fs
      .readdirSync(basePath)
      .filter(dir => fs.statSync(path.join(basePath, dir)).isDirectory())

    // Iterate over each subdirectory
    for (const subDir of subDirectories) {
      const packageJsonPath = path.join(basePath, subDir, 'package.json')

      // Check if package.json exists
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

        // Check if wagmi is a dependency
        if (packageJson.dependencies && packageJson.dependencies['wagmi']) {
          const currentVersion = packageJson.dependencies['wagmi']

          // Update to the latest version if different
          if (currentVersion !== latest) {
            packageJson.dependencies['wagmi'] = `${latest}`
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
            console.log(`Updated wagmi in ${subDir} from ${currentVersion} to ${latest}`)
          }
        }
      }
    }
  }
}

// Execute the update function and handle errors
updateWagmiDependencies().catch(err => console.error(err))
