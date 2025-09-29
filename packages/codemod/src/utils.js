#!/usr/bin/env node
import fs from 'fs'
import latestVersion from 'latest-version'
import path from 'path'

const IGNORED_FOLDERS = ['node_modules', 'ui-new', '.git', 'dist']

/**
 * Recursively finds all package.json files in a directory and its subdirectories
 * @param {string} dir - The directory to start searching from
 * @param {number} [maxDepth=5] - Maximum depth to search in subdirectories
 * @param {number} [depth=0] - Current depth in the recursion
 * @returns {string[]} Array of paths to found package.json files
 */
export function findAllPackageJsonFiles(dir, maxDepth = 5, depth = 0) {
  if (depth > maxDepth) return []
  let packageJsonFiles = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !IGNORED_FOLDERS.includes(entry.name)) {
      packageJsonFiles = packageJsonFiles.concat(
        findAllPackageJsonFiles(fullPath, maxDepth, depth + 1)
      )
    } else if (entry.isFile() && entry.name === 'package.json') {
      packageJsonFiles.push(fullPath)
    }
  }

  return packageJsonFiles
}

/**
 * Updates dependencies in all relevant package.json files
 * @param {string[]} packages - Array of package names to update
 * @returns {Promise<void>} Promise that resolves when all updates are complete
 */
export async function updateDependencies(packages) {
  const rootDir = path.resolve(new URL('.', import.meta.url).pathname, '../../../')
  const packageJsonFiles = findAllPackageJsonFiles(rootDir)

  for (const packageJsonPath of packageJsonFiles) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

      for (const pkg of packages) {
        if (pkg.endsWith('/*')) {
          // Handle wildcard patterns
          const org = pkg.slice(0, -2)
          const dependencies = packageJson.dependencies || {}
          const matchingPackages = Object.keys(dependencies).filter(dep => dep.startsWith(org))

          for (const matchingPkg of matchingPackages) {
            await updatePackageVersion(packageJson, matchingPkg, packageJsonPath)
          }
        } else {
          const currentVersion =
            packageJson.dependencies?.[pkg] ||
            packageJson.peerDependencies?.[pkg] ||
            packageJson.optionalDependencies?.[pkg] ||
            packageJson.devDependencies?.[pkg]
          // Handle specific package names
          if (packageJson.dependencies && currentVersion) {
            await updatePackageVersion(packageJson, pkg, packageJsonPath)
          }
        }
      }
    } catch (error) {
      console.error(`Failed to process ${packageJsonPath}:`, error)
    }
  }
}

/**
 * Updates the version of a specific package in package.json
 * @param {Object} packageJson - The parsed package.json contents
 * @param {string} pkg - The package name to update
 * @param {string} packageJsonPath - Path to the package.json file
 * @returns {Promise<void>} Promise that resolves when update is complete
 */
export async function updatePackageVersion(packageJson, pkg, packageJsonPath) {
  try {
    const currentVersion =
      packageJson.dependencies?.[pkg] ||
      packageJson.peerDependencies?.[pkg] ||
      packageJson.optionalDependencies?.[pkg] ||
      packageJson.devDependencies?.[pkg]
    const majorVersion = currentVersion.split('.')[0]

    const latest = await Promise.race([
      latestVersion(pkg, { version: majorVersion }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000))
    ])

    // Preserve version constraints like ">="
    const versionPrefix = currentVersion.match(/^[^\d]*/)[0] || ''
    const newVersion = `${versionPrefix}${latest}`

    if (currentVersion !== newVersion) {
      if (packageJson.dependencies && packageJson.dependencies?.[pkg]) {
        packageJson.dependencies[pkg] = newVersion
      } else if (packageJson.peerDependencies && packageJson.peerDependencies?.[pkg]) {
        packageJson.peerDependencies[pkg] = newVersion
      } else if (packageJson.optionalDependencies && packageJson.optionalDependencies?.[pkg]) {
        packageJson.optionalDependencies[pkg] = newVersion
      } else if (packageJson.devDependencies && packageJson.devDependencies?.[pkg]) {
        packageJson.devDependencies[pkg] = newVersion
      }

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
      console.log(
        `Updated ${pkg} in ${JSON.parse(fs.readFileSync(packageJsonPath)).name} from ${currentVersion} to ${newVersion}`
      )
    }
  } catch (error) {
    console.error(`Failed to update ${pkg}:`, error)
  }
}
