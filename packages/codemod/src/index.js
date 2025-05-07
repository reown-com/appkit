#!/usr/bin/env node
import fs from 'fs'
import latestVersion from 'latest-version'
import path from 'path'

// Function to update dependencies in all relevant package.json files
async function updateDependencies(packages) {
  const rootDir = path.resolve(new URL('.', import.meta.url).pathname, '../../../')
  const directoriesToSearch = ['packages', 'examples', 'apps']

  for (const baseDir of directoriesToSearch) {
    const basePath = path.join(rootDir, baseDir)
    const subDirectories = fs
      .readdirSync(basePath)
      .filter(dir => fs.statSync(path.join(basePath, dir)).isDirectory())

    for (const subDir of subDirectories) {
      const packageJsonPath = path.join(basePath, subDir, 'package.json')

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

        for (const pkg of packages) {
          if (pkg.endsWith('/*')) {
            // Handle wildcard patterns
            const org = pkg.slice(0, -2)
            const dependencies = packageJson.dependencies || {}
            const matchingPackages = Object.keys(dependencies).filter(dep => dep.startsWith(org))

            for (const matchingPkg of matchingPackages) {
              await updatePackageVersion(packageJson, matchingPkg, packageJsonPath, subDir)
            }
          } else {
            // Handle specific package names
            if (packageJson.dependencies && packageJson.dependencies[pkg]) {
              await updatePackageVersion(packageJson, pkg, packageJsonPath, subDir)
            }
          }
        }
      }
    }
  }
}

// Function to update a specific package version
async function updatePackageVersion(packageJson, pkg, packageJsonPath, subDir) {
  const currentVersion = packageJson.dependencies[pkg]
  const latest = await latestVersion(pkg)

  // Preserve version constraints like ">="
  const versionPrefix = currentVersion.match(/^[^\d]*/)[0] || ''
  const newVersion = `${versionPrefix}${latest}`

  if (currentVersion !== newVersion) {
    packageJson.dependencies[pkg] = newVersion
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log(`Updated ${pkg} in ${subDir} from ${currentVersion} to ${newVersion}`)
  }
}

// Get command and package names from command-line arguments
const [command, ...packagesToUpdate] = process.argv.slice(2)

// Check if the command is 'upgrade'
if (command === 'upgrade') {
  // Execute the update function and handle errors
  updateDependencies(packagesToUpdate).catch(err => console.error(err))
} else {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}
